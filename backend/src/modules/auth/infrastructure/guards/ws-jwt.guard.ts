/**
 * @file ws-jwt.guard.ts
 * @description Guard de WebSocket que valida JWT en cada mensaje entrante.
 *
 * A diferencia de HTTP, los WebSockets no usan Passport directamente.
 * Este guard extrae el token de:
 *   1. `handshake.auth.token` (forma recomendada por socket.io v3+)
 *   2. `handshake.headers.authorization` (fallback estilo HTTP)
 *
 * Si el token es válido, asigna `client.data.user = { userId, username }`
 * para que el gateway pueda identificar al emisor de cada evento.
 */
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

/**
 * Guard que se aplica con `@UseGuards(WsJwtGuard)` en handlers
 * `@SubscribeMessage(...)` del `ChatGateway`.
 *
 * Retorna `false` (rechazo) en lugar de lanzar para mantener el log
 * limpio y permitir que socket.io informe el error al cliente.
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Verifica el token JWT enviado en el handshake del socket.
   *
   * @returns `true` si el token es válido; `false` en caso contrario.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers?.authorization?.toString().replace('Bearer ', ''));

    if (!token) return false;
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      // Adjuntamos el usuario al socket para que los handlers lo lean
      (client as Socket & { data: { user: unknown } }).data.user = {
        userId: payload.sub,
        username: payload.username,
      };
      return true;
    } catch (err) {
      this.logger.warn(`WS auth failed: ${(err as Error).message}`);
      return false;
    }
  }
}
