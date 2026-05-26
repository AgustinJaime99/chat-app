/**
 * @file app.module.ts
 * @description Módulo raíz de la aplicación. Compone todos los módulos
 * funcionales y la configuración global.
 *
 * Módulos compuestos:
 * - `ConfigModule`: carga `.env` y valida las variables requeridas con Joi.
 * - `ThrottlerModule`: rate limiting global (100 req/min por IP).
 * - `PrismaModule`: cliente Prisma compartido (declarado @Global).
 * - `AuthModule`: autenticación JWT (registro, login, guards).
 * - `UserModule`: persistencia y dominio de usuarios.
 * - `ChatModule`: rooms, mensajes, gateway WebSocket e invitaciones.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';

/**
 * Módulo raíz. Su única responsabilidad es declarar imports.
 *
 * El esquema Joi garantiza que la app no arranque si faltan variables
 * críticas (DB, JWT secrets) o si tienen tipos inválidos.
 */
@Module({
  imports: [
    // Configuración global con validación de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
      }),
    }),
    // Rate limiting: máximo 100 requests cada 60 segundos por IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UserModule,
    ChatModule,
  ],
})
export class AppModule {}
