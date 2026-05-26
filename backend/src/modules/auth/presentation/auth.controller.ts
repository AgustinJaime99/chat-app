/**
 * @file auth.controller.ts
 * @description Controlador HTTP del módulo Auth.
 *
 * Capa: **Presentation**.
 * Expone las rutas REST bajo `/api/auth`. No contiene lógica de negocio:
 * delega íntegramente en los use-cases.
 *
 * Rutas:
 * - `POST /api/auth/register` → registro de usuario.
 * - `POST /api/auth/login`    → autenticación y emisión de tokens.
 * - `GET  /api/auth/me`       → datos del usuario autenticado (requiere JWT).
 */
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../application/dtos/register.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUC: RegisterUseCase,
    private readonly loginUC: LoginUseCase,
  ) {}

  /**
   * Registra un nuevo usuario.
   *
   * @body {RegisterDto} Email, username y password.
   * @returns Datos públicos del usuario creado.
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUC.execute(dto);
  }

  /**
   * Autentica un usuario y emite tokens JWT.
   *
   * @body {LoginDto} identifier (email/username) + password.
   * @returns `{ accessToken, refreshToken, user }`.
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUC.execute(dto);
  }

  /**
   * Retorna la identidad del usuario autenticado.
   *
   * Útil como "session check" desde el frontend tras un refresh.
   * `req.user` lo pobló `JwtStrategy.validate()`.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { userId: string; username: string } }) {
    return req.user;
  }
}
