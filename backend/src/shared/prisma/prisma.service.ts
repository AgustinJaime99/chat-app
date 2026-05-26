/**
 * @file prisma.service.ts
 * @description Wrapper de `PrismaClient` integrado con el ciclo de vida de NestJS.
 *
 * Extiende `PrismaClient` para exponer todos los modelos generados (User,
 * Room, Message, RoomMember, RoomInvite) y se conecta automáticamente al
 * iniciar la app y se desconecta al destruirse el módulo.
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio singleton que provee acceso a la base de datos vía Prisma.
 *
 * Implementa:
 * - `OnModuleInit`: abre el pool de conexiones cuando arranca el módulo.
 * - `OnModuleDestroy`: cierra el pool al apagar la app (graceful shutdown).
 *
 * Se inyecta en cualquier servicio/repositorio que necesite acceder a la DB
 * gracias a que `PrismaModule` es global (`@Global()`).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** Hook de NestJS: establece la conexión al arrancar la app. */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /** Hook de NestJS: cierra la conexión al cerrar la app. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
