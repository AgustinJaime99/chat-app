/**
 * @file chat.module.ts
 * @description Módulo del bounded context "Chat".
 *
 * Agrupa:
 * - **Repositorio de mensajes** (`MessagePrismaRepository`) enlazado al token
 *   `MESSAGE_REPOSITORY`.
 * - **Use cases**: `SendMessageUseCase`, `GetRoomMessagesUseCase`.
 * - **Gateway WebSocket** (`ChatGateway`) que maneja eventos en tiempo real.
 * - **Controller REST** (`ChatController`) con endpoints de rooms,
 *   invitaciones, join/leave e historial de mensajes.
 *
 * Importa `AuthModule` para reutilizar `JwtAuthGuard`, `WsJwtGuard` y
 * `JwtService`.
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { MessagePrismaRepository } from './infrastructure/persistence/message.prisma.repository';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetRoomMessagesUseCase } from './application/use-cases/get-room-messages.use-case';
import { ChatGateway } from './infrastructure/gateways/chat.gateway';
import { ChatController } from './presentation/chat.controller';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [
    { provide: MESSAGE_REPOSITORY, useClass: MessagePrismaRepository },
    SendMessageUseCase,
    GetRoomMessagesUseCase,
    ChatGateway,
  ],
})
export class ChatModule {}
