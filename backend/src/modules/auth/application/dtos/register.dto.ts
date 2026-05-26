/**
 * @file register.dto.ts
 * @description DTO de entrada para el endpoint `POST /api/auth/register`.
 */
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

/**
 * Payload de registro de un nuevo usuario.
 *
 * Reglas de validación:
 * - `email`: formato de email válido (RFC 5322).
 * - `username`: mínimo 3 caracteres, solo `[a-zA-Z0-9_]`.
 * - `password`: mínimo 8 caracteres (se hashea con bcrypt en el use case).
 */
export class RegisterDto {
  /** Email único en el sistema. */
  @IsEmail()
  email!: string;

  /** Username único, sin espacios ni símbolos especiales. */
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username only letters, numbers, underscore' })
  username!: string;

  /** Contraseña en texto plano; nunca se guarda tal cual. */
  @IsString()
  @MinLength(8)
  password!: string;
}
