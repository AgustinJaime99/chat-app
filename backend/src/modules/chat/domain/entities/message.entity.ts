/**
 * @file message.entity.ts
 * @description Entidad de dominio que representa un mensaje de chat.
 *
 * Capa: **Domain**.
 * Modelo inmutable, sin dependencias de Prisma ni NestJS.
 *
 * @property id        UUID del mensaje.
 * @property content   Texto del mensaje (máximo 2000 caracteres en el DTO).
 * @property userId    ID del autor.
 * @property roomId    ID del room al que pertenece.
 * @property createdAt Timestamp del envío.
 */
export class MessageEntity {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly userId: string,
    public readonly roomId: string,
    public readonly createdAt: Date,
  ) {}
}
