/**
 * @file register.use-case.ts
 * @description Caso de uso: registrar un nuevo usuario.
 *
 * Capa: **Application**.
 * Orquesta el flujo de registro sin conocer detalles de HTTP, Prisma ni bcrypt.
 */
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../user/domain/repositories/user.repository';
import { IPasswordHasher, PASSWORD_HASHER } from '../../domain/services/password-hasher';
import { RegisterDto } from '../dtos/register.dto';

/**
 * Use case que registra un usuario en el sistema.
 *
 * Reglas de negocio:
 * 1. El email debe ser único.
 * 2. El username debe ser único.
 * 3. La contraseña se almacena hasheada (bcrypt), nunca en texto plano.
 */
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  /**
   * Ejecuta el registro.
   *
   * @param dto Datos validados del nuevo usuario.
   * @returns Datos públicos del usuario (sin password).
   * @throws {ConflictException} Si el email o username ya están en uso.
   */
  async execute(dto: RegisterDto) {
    // Verificación paralela de unicidad para minimizar latencia
    const [byEmail, byUsername] = await Promise.all([
      this.users.findByEmail(dto.email),
      this.users.findByUsername(dto.username),
    ]);
    if (byEmail) throw new ConflictException('Email already in use');
    if (byUsername) throw new ConflictException('Username already in use');

    // Hash de la contraseña antes de persistir
    const hashed = await this.hasher.hash(dto.password);
    const user = await this.users.create({
      email: dto.email,
      username: dto.username,
      password: hashed,
    });

    // Retornamos solo info pública: nunca exponemos el hash de la password
    return { id: user.id, email: user.email, username: user.username };
  }
}
