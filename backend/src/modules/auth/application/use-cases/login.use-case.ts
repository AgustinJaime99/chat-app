/**
 * @file login.use-case.ts
 * @description Caso de uso: autenticar a un usuario y emitir tokens JWT.
 *
 * Capa: **Application**.
 * Permite login con email o username; produce un par access/refresh token.
 */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository, USER_REPOSITORY } from '../../../user/domain/repositories/user.repository';
import { IPasswordHasher, PASSWORD_HASHER } from '../../domain/services/password-hasher';
import { LoginDto } from '../dtos/login.dto';

/**
 * Use case que valida credenciales y emite tokens JWT.
 *
 * Estrategia de búsqueda: primero por email, luego por username
 * (el `identifier` admite ambos formatos).
 *
 * Se devuelven dos tokens:
 * - **accessToken**: corta duración (15m por defecto). Para endpoints protegidos.
 * - **refreshToken**: larga duración (7d). Para renovar el access sin re-login.
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Ejecuta el login.
   *
   * @param dto Credenciales (identifier + password).
   * @returns `{ accessToken, refreshToken, user }`.
   * @throws {UnauthorizedException} Si no existe el usuario o la password no coincide.
   *
   * Nota de seguridad: el mismo error genérico ("Invalid credentials") se
   * devuelve en ambos casos para evitar enumeración de usuarios.
   */
  async execute(dto: LoginDto) {
    // Resolver al usuario por email o, si no, por username
    const user =
      (await this.users.findByEmail(dto.identifier)) ??
      (await this.users.findByUsername(dto.identifier));
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Verificación de la contraseña contra el hash almacenado
    const ok = await this.hasher.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Payload estándar JWT: `sub` (subject) + claim de username
    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }
}
