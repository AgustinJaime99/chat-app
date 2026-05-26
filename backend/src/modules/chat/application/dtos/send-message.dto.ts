/**
 * @file send-message.dto.ts
 * @description DTO usado por el evento WebSocket `message:send`.
 *
 * Se valida automáticamente gracias al `ValidationPipe` aplicado en
 * `ChatGateway.onMessage`.
 */
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * Payload entrante para enviar un mensaje a un room.
 *
 * @property roomId  UUID del room destino.
 * @property content Texto del mensaje (1 a 2000 caracteres).
 */
export class SendMessageDto {
  /** UUID del room destino. */
  @IsUUID()
  roomId!: string;

  /** Contenido del mensaje. Vacíos y mensajes excesivos son rechazados. */
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
