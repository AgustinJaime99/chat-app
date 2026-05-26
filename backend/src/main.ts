/**
 * @file main.ts
 * @description Punto de entrada (bootstrap) de la aplicación NestJS.
 *
 * Responsabilidades:
 * - Crear la instancia de la aplicación a partir de `AppModule`.
 * - Configurar middlewares globales de seguridad (Helmet, CORS).
 * - Registrar el prefijo global `/api` para todas las rutas HTTP.
 * - Habilitar validación automática de DTOs con `class-validator`.
 * - Exponer la documentación Swagger en `/api/docs`.
 * - Iniciar el servidor en el puerto configurado (por defecto 3001).
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Inicializa y arranca la aplicación NestJS.
 *
 * Flujo:
 * 1. Crea la app con todos los módulos cargados.
 * 2. Aplica `helmet()` para headers HTTP seguros (XSS, clickjacking, etc.).
 * 3. Habilita CORS contra el origen configurado en `CORS_ORIGIN`.
 * 4. Activa el `ValidationPipe` global con:
 *    - `whitelist`: elimina propiedades no declaradas en el DTO.
 *    - `forbidNonWhitelisted`: rechaza payloads con campos extra.
 *    - `transform`: convierte tipos primitivos automáticamente.
 * 5. Construye y publica el documento Swagger con autenticación Bearer.
 * 6. Levanta el servidor HTTP escuchando en el puerto configurado.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Headers de seguridad estándar
  app.use(helmet());

  // CORS habilitado solo para el frontend autorizado
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN'),
    credentials: true,
  });

  // Todas las rutas HTTP quedan bajo /api
  app.setGlobalPrefix('api');

  // Validación automática de todos los DTOs entrantes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('Realtime chat backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
