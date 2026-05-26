/**
 * @file chat.gateway.ts
 * @description Gateway WebSocket para mensajería en tiempo real.
 *
 * Capa: **Infrastructure** (adaptador de transporte).
 * Namespace: `/chat`.
 *
 * Eventos entrantes (client → server):
 * - `room:join`    → unirse a un room (canal socket.io).
 * - `room:leave`   → abandonar un room.
 * - `message:send` → enviar un mensaje (se persiste y se broadcast).
 * - `typing`       → notificar al room que el usuario está escribiendo.
 *
 * Eventos salientes (server → client):
 * - `room:user-joined` → otro usuario se sumó al room.
 * - `message:new`      → nuevo mensaje en el room.
 * - `typing`           → otro usuario está/no está escribiendo.
 *
 * Autenticación:
 * - El handshake exige un JWT (vía `handshake.auth.token`).
 * - Cada evento individual también pasa por `WsJwtGuard`.
 */
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../../../auth/infrastructure/guards/ws-jwt.guard';
import { SendMessageDto } from '../../application/dtos/send-message.dto';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';

/**
 * Socket extendido con la identidad del usuario inyectada por el guard.
 * Permite acceder a `client.data.user` con tipado completo.
 */
interface AuthedSocket extends Socket {
  data: { user: { userId: string; username: string } };
}

/**
 * Gateway que expone el namespace `/chat`.
 *
 * Implementa los hooks de socket.io:
 * - `handleConnection`: autentica el handshake con JWT.
 * - `handleDisconnect`: solo loguea el cierre.
 */
@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly sendMessage: SendMessageUseCase,
  ) {}

  /**
   * Verifica el JWT durante el handshake inicial.
   *
   * Si falta o es inválido, desconecta el socket inmediatamente (cierre
   * temprano para no consumir recursos en conexiones no autenticadas).
   * Si es válido, persiste `userId` y `username` en `client.data.user`.
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        client.handshake.headers?.authorization?.toString().replace('Bearer ', '');
      if (!token) throw new Error('No token');
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      (client as AuthedSocket).data.user = {
        userId: payload.sub,
        username: payload.username,
      };
      this.logger.log(`Client connected: ${payload.username} (${client.id})`);
    } catch (err) {
      this.logger.warn(`Rejected WS connection: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  /** Log de cierre de conexión. */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Evento `room:join`.
   *
   * El cliente se suscribe al canal de socket.io correspondiente al `roomId`,
   * de modo que recibirá todos los `message:new` y `typing` emitidos al room.
   * Notifica a los demás miembros con `room:user-joined`.
   *
   * @param data `{ roomId }`
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('room:join')
  async onJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    await client.join(data.roomId);
    client.to(data.roomId).emit('room:user-joined', {
      userId: client.data.user.userId,
      username: client.data.user.username,
    });
    return { ok: true };
  }

  /**
   * Evento `room:leave`. Desuscribe al cliente del canal del room.
   *
   * @param data `{ roomId }`
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('room:leave')
  async onLeave(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    await client.leave(data.roomId);
    return { ok: true };
  }

  /**
   * Evento `message:send`.
   *
   * Flujo:
   * 1. El DTO se valida con `ValidationPipe` local.
   * 2. Se persiste a través de `SendMessageUseCase`.
   * 3. Se hace broadcast al room con el evento `message:new`.
   *
   * @param dto `SendMessageDto`
   * @returns el payload emitido (útil para ack del cliente).
   */
  @UseGuards(WsJwtGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @SubscribeMessage('message:send')
  async onMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const saved = await this.sendMessage.execute({
      content: dto.content,
      roomId: dto.roomId,
      userId: client.data.user.userId,
    });
    const payload = {
      id: saved.id,
      content: saved.content,
      roomId: saved.roomId,
      userId: saved.userId,
      username: client.data.user.username,
      createdAt: saved.createdAt,
    };
    this.server.to(dto.roomId).emit('message:new', payload);
    return payload;
  }

  /**
   * Evento `typing`. Reenvía un indicador de "está escribiendo" a los demás
   * miembros del room (no se persiste).
   *
   * @param data `{ roomId, isTyping }`
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  onTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    client.to(data.roomId).emit('typing', {
      userId: client.data.user.userId,
      username: client.data.user.username,
      isTyping: data.isTyping,
    });
  }
}
