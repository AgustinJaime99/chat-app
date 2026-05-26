/**
 * @file message.prisma.repository.ts
 * @description Implementación Prisma de `IMessageRepository`.
 *
 * Capa: **Infrastructure**.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { MessageEntity } from '../../domain/entities/message.entity';
import { IMessageRepository } from '../../domain/repositories/message.repository';

/**
 * Adaptador Prisma que persiste y recupera mensajes de la tabla `Message`.
 * Mapea las filas de Prisma a `MessageEntity` para aislar a la capa de
 * dominio del ORM.
 */
@Injectable()
export class MessagePrismaRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** @inheritdoc */
  async create(data: { content: string; userId: string; roomId: string }): Promise<MessageEntity> {
    const m = await this.prisma.message.create({ data });
    return new MessageEntity(m.id, m.content, m.userId, m.roomId, m.createdAt);
  }

  /**
   * @inheritdoc
   *
   * Estrategia: traemos los más recientes con `desc + take` (eficiente
   * gracias al índice `[roomId, createdAt]`) y luego invertimos el
   * array para devolverlos en orden cronológico ascendente.
   */
  async findByRoom(roomId: string, limit: number): Promise<MessageEntity[]> {
    const rows = await this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows
      .reverse()
      .map((m) => new MessageEntity(m.id, m.content, m.userId, m.roomId, m.createdAt));
  }
}
