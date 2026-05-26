/**
 * @file login.dto.ts
 * @description DTO de entrada para el endpoint `POST /api/auth/login`.
 */
import { IsString, MinLength } from 'class-validator';

/**
 * Payload de login. Permite autenticarse indistintamente con email o username.
 *
 * @property identifier Email o username del usuario.
 * @property password   Contraseña en texto plano (mínimo 8 caracteres).
 */
export class LoginDto {
  /** Email o username — el use case detecta el tipo automáticamente. */
  @IsString()
  identifier!: string;

  /** Contraseña; será comparada contra el hash bcrypt almacenado. */
  @IsString()
  @MinLength(8)
  password!: string;
}
