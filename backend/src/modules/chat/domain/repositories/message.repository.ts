/**
 * @file message.repository.ts
 * @description Contrato (puerto) del repositorio de mensajes.
 *
 * Capa: **Domain**.
 * Los use-cases (`SendMessageUseCase`, `GetRoomMessagesUseCase`) dependen
 * de esta interfaz, no de su implementación.
 */
import { MessageEntity } from '../entities/message.entity';

/** Token DI para inyectar el repositorio de mensajes. */
export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

/**
 * Operaciones de persistencia sobre `MessageEntity`.
 */
export interface IMessageRepository {
  /** Persiste un nuevo mensaje. */
  create(data: { content: string; userId: string; roomId: string }): Promise<MessageEntity>;

  /**
   * Obtiene los últimos `limit` mensajes de un room, ordenados
   * cronológicamente (más antiguo → más reciente).
   */
  findByRoom(roomId: string, limit: number): Promise<MessageEntity[]>;
}
