/**
 * @file user.module.ts
 * @description Módulo del bounded context "User".
 *
 * Realiza el binding entre la interfaz `IUserRepository` (dominio) y la
 * implementación `UserPrismaRepository` (infraestructura) usando el token
 * `USER_REPOSITORY`. Exporta el token para que `AuthModule` pueda
 * inyectarlo en sus use-cases (Register, Login).
 */
import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { UserPrismaRepository } from './infrastructure/persistence/user.prisma.repository';

@Module({
  providers: [
    // Provee el adaptador Prisma cuando se inyecta USER_REPOSITORY
    { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
