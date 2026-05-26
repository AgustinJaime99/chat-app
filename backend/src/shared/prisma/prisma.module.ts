/**
 * @file prisma.module.ts
 * @description Módulo global que expone `PrismaService` a toda la aplicación.
 *
 * Al estar marcado como `@Global()`, no es necesario importar `PrismaModule`
 * en cada módulo que necesite la base de datos: basta con inyectar
 * `PrismaService`.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
