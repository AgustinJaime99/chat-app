/**
 * @file chat.controller.ts
 * @description Controlador REST del módulo Chat. Todas las rutas están
 * bajo `/api/chat` y requieren un JWT válido (`JwtAuthGuard` global).
 *
 * Capa: **Presentation**.
 *
 * Rutas:
 * - `GET    /api/chat/rooms`                   → rooms a los que pertenece el usuario.
 * - `GET    /api/chat/rooms/public`            → top rooms públicos por popularidad.
 * - `POST   /api/chat/rooms`                   → crear room (público o privado).
 * - `POST   /api/chat/rooms/:id/join`          → unirse a un room público.
 * - `POST   /api/chat/rooms/:id/leave`         → abandonar un room.
 * - `GET    /api/chat/rooms/:id/messages`      → historial reciente del room.
 * - `POST   /api/chat/rooms/:id/invite`        → generar link de invitación.
 * - `GET    /api/chat/invite/:token`           → validar token y ver info del room.
 * - `POST   /api/chat/invite/:token/accept`    → aceptar invitación y unirse.
 *
 * Nota: usa `PrismaService` directamente para queries de rooms/membership/
 * invites porque aún no se extrajeron a un repositorio de dominio.
 */
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { GetRoomMessagesUseCase } from '../application/use-cases/get-room-messages.use-case';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getMessages: GetRoomMessagesUseCase,
  ) {}

  /**
   * Lista los rooms a los que el usuario pertenece como miembro.
   * Incluye conteo de miembros para mostrar en la UI.
   *
   * @returns Array de rooms con `_count.members`, ordenados del más reciente al más antiguo.
   */
  @Get('rooms')
  async rooms(@Req() req: { user: { userId: string } }) {
    return this.prisma.room.findMany({
      where: {
        members: {
          some: { userId: req.user.userId },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lista los "Top Rooms" públicos:
   * - Solo rooms con `isPrivate = false`.
   * - Excluye los rooms en los que el usuario ya es miembro.
   * - Ordena por cantidad de miembros (descendente).
   * - Límite: 20 resultados.
   *
   * Usado por la pestaña "Join a Room" del frontend.
   */
  @Get('rooms/public')
  async publicRooms(@Req() req: { user: { userId: string } }) {
    const userRoomIds = await this.prisma.roomMember
      .findMany({
        where: { userId: req.user.userId },
        select: { roomId: true },
      })
      .then((r) => r.map((x) => x.roomId));

    return this.prisma.room.findMany({
      where: {
        isPrivate: false,
        id: { notIn: userRoomIds },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        members: { _count: 'desc' },
      },
      take: 20,
    });
  }

  /**
   * Crea un nuevo room y agrega automáticamente al creador como miembro.
   *
   * @body `{ name, isPrivate? }` — `isPrivate=true` requiere invitación para entrar.
   */
  @Post('rooms')
  async createRoom(
    @Body() body: { name: string; isPrivate?: boolean },
    @Req() req: { user: { userId: string } },
  ) {
    const room = await this.prisma.room.create({
      data: { name: body.name, isPrivate: body.isPrivate ?? false },
    });
    await this.prisma.roomMember.create({
      data: { userId: req.user.userId, roomId: room.id },
    });
    return room;
  }

  /**
   * Une al usuario a un room público.
   *
   * - `upsert` evita el error si ya era miembro (idempotente).
   * - Rechaza el intento si el room es privado.
   *
   * @throws Error 'Room not found' si el `id` no existe.
   * @throws Error 'Cannot join private room without invite' si es privado.
   */
  @Post('rooms/:id/join')
  async joinRoom(
    @Param('id') roomId: string,
    @Req() req: { user: { userId: string } },
  ) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');
    if (room.isPrivate) throw new Error('Cannot join private room without invite');

    await this.prisma.roomMember.upsert({
      where: { userId_roomId: { userId: req.user.userId, roomId } },
      create: { userId: req.user.userId, roomId },
      update: {},
    });

    return room;
  }

  /**
   * Quita al usuario de la lista de miembros del room.
   * Es idempotente: no falla si el usuario no era miembro.
   */
  @Post('rooms/:id/leave')
  async leaveRoom(
    @Param('id') roomId: string,
    @Req() req: { user: { userId: string } },
  ) {
    await this.prisma.roomMember.deleteMany({
      where: { userId: req.user.userId, roomId },
    });
    return { success: true };
  }

  /**
   * Devuelve el historial reciente del room.
   *
   * @query limit Cantidad de mensajes a retornar (default 50).
   */
  @Get('rooms/:id/messages')
  history(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.getMessages.execute(id, limit ? Number(limit) : 50);
  }

  /**
   * Genera un link de invitación compartible para el room.
   *
   * El token se genera automáticamente como UUID en Prisma. El frontend
   * usa el `inviteUrl` retornado para copiar al portapapeles.
   *
   * @returns `{ inviteUrl: "<FRONTEND_URL>/invite/<token>" }`
   */
  @Post('rooms/:id/invite')
  async createInvite(
    @Param('id') roomId: string,
    @Req() req: { user: { userId: string } },
  ) {
    const invite = await this.prisma.roomInvite.create({
      data: { roomId, createdBy: req.user.userId },
    });
    return { inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${invite.token}` };
  }

  /**
   * Valida un token de invitación y retorna información del room destino.
   *
   * Llamado por la página `/invite/[token]` antes de mostrar el botón
   * "Join Room".
   *
   * @throws Error 'Invalid invite' si el token no existe.
   * @throws Error 'Invite expired' si `expiresAt` ya pasó.
   */
  @Get('invite/:token')
  async getInvite(@Param('token') token: string) {
    const invite = await this.prisma.roomInvite.findUnique({
      where: { token },
      include: { room: true },
    });
    if (!invite) throw new Error('Invalid invite');
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error('Invite expired');
    return { room: invite.room };
  }

  /**
   * Acepta una invitación y agrega al usuario como miembro del room.
   *
   * - Idempotente: si ya era miembro, no falla.
   * - Valida nuevamente el token (no se confa solo en `getInvite`).
   *
   * @returns El room al que se unió.
   */
  @Post('invite/:token/accept')
  async acceptInvite(
    @Param('token') token: string,
    @Req() req: { user: { userId: string } },
  ) {
    const invite = await this.prisma.roomInvite.findUnique({ where: { token } });
    if (!invite) throw new Error('Invalid invite');
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error('Invite expired');
    
    await this.prisma.roomMember.upsert({
      where: { userId_roomId: { userId: req.user.userId, roomId: invite.roomId } },
      create: { userId: req.user.userId, roomId: invite.roomId },
      update: {},
    });
    
    return this.prisma.room.findUnique({ where: { id: invite.roomId } });
  }
}
