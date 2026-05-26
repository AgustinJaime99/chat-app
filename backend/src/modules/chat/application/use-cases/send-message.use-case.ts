/**
 * @file send-message.use-case.ts
 * @description Caso de uso: persistir un mensaje recibido por WebSocket.
 *
 * Capa: **Application**.
 * Es invocado desde `ChatGateway.onMessage` después de validar el DTO.
 */
import { Inject, Injectable } from '@nestjs/common';
import { IMessageRepository, MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';

/**
 * Persiste un mensaje en la base de datos.
 *
 * Por simplicidad delega directamente en el repositorio. Si en el futuro
 * se agrega lógica adicional (filtros anti-spam, menciones, traducción,
 * etc.), debe ir aquí.
 */
@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly repo: IMessageRepository,
  ) {}

  /**
   * Crea el mensaje.
   * @param input Contenido, autor y room.
   * @returns La `MessageEntity` persistida.
   */
  execute(input: { content: string; userId: string; roomId: string }) {
    return this.repo.create(input);
  }
}
