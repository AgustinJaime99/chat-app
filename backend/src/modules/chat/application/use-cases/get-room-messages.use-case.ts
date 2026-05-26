/**
 * @file get-room-messages.use-case.ts
 * @description Caso de uso: obtener el historial reciente de un room.
 *
 * Capa: **Application**.
 * Invocado por `ChatController.history` para cargar mensajes cuando un
 * usuario abre un room en el frontend.
 */
import { Inject, Injectable } from '@nestjs/common';
import { IMessageRepository, MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';

/**
 * Devuelve los últimos N mensajes de un room.
 *
 * El orden retornado es cronológico ascendente para que el frontend
 * pueda renderizarlos directamente sin invertir el array.
 */
@Injectable()
export class GetRoomMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly repo: IMessageRepository,
  ) {}

  /**
   * @param roomId UUID del room.
   * @param limit  Cantidad máxima de mensajes (default 50).
   */
  execute(roomId: string, limit = 50) {
    return this.repo.findByRoom(roomId, limit);
  }
}
