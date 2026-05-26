/**
 * @file auth.module.ts
 * @description Módulo de autenticación. Agrupa registro, login, JWT y guards.
 *
 * Provee:
 * - **Use cases**: `RegisterUseCase`, `LoginUseCase`.
 * - **Estrategia Passport**: `JwtStrategy` (extrae el token del header
 *   `Authorization: Bearer ...`).
 * - **Guards**: `JwtAuthGuard` (HTTP) y `WsJwtGuard` (WebSocket).
 * - **Hashing**: `BcryptPasswordHasher` enlazado al token `PASSWORD_HASHER`.
 *
 * Importa `UserModule` para acceder a `IUserRepository` y `JwtModule`
 * configurado dinámicamente con secrets desde variables de entorno.
 *
 * Exporta `JwtAuthGuard`, `WsJwtGuard` y `JwtModule` para que `ChatModule`
 * pueda proteger sus endpoints y verificar tokens en el gateway.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { PASSWORD_HASHER } from './domain/services/password-hasher';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { WsJwtGuard } from './infrastructure/guards/ws-jwt.guard';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
    JwtAuthGuard,
    WsJwtGuard,
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
  exports: [JwtAuthGuard, WsJwtGuard, JwtModule],
})
export class AuthModule {}
