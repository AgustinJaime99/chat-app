/**
 * @file user.prisma.repository.ts
 * @description Implementación concreta de `IUserRepository` usando Prisma.
 *
 * Capa: **Infrastructure**.
 * Se encarga de mapear filas de la tabla `User` a `UserEntity` (dominio)
 * para que la capa de aplicación nunca dependa del modelo Prisma.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';

/**
 * Adaptador Prisma para el repositorio de usuarios.
 *
 * Se registra en `UserModule` con el token `USER_REPOSITORY`, de modo que
 * cualquier consumidor inyecta la interfaz, no esta clase.
 */
@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** @inheritdoc */
  async findById(id: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return u ? UserEntity.create(u) : null;
  }

  /** @inheritdoc */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({ where: { email } });
    return u ? UserEntity.create(u) : null;
  }

  /** @inheritdoc */
  async findByUsername(username: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({ where: { username } });
    return u ? UserEntity.create(u) : null;
  }

  /** @inheritdoc */
  async create(data: { email: string; username: string; password: string }): Promise<UserEntity> {
    const u = await this.prisma.user.create({ data });
    return UserEntity.create(u);
  }
}
