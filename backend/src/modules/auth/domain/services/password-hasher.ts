/**
 * @file password-hasher.ts
 * @description Contrato del servicio de hashing de contraseñas.
 *
 * Capa: **Domain**.
 * La capa de aplicación depende solo de esta interfaz, no de bcrypt
 * directamente. Esto permite cambiar el algoritmo (argon2, scrypt, etc.)
 * sin tocar los use-cases.
 */

/** Token DI para inyectar el password hasher. */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

/**
 * Define las operaciones de hashing y verificación.
 *
 * Implementación por defecto: `BcryptPasswordHasher`.
 */
export interface IPasswordHasher {
  /**
   * Genera el hash de una contraseña en texto plano.
   * @param plain Contraseña a hashear.
   */
  hash(plain: string): Promise<string>;

  /**
   * Compara una contraseña en texto plano contra un hash previamente generado.
   * @param plain  Contraseña ingresada por el usuario.
   * @param hashed Hash almacenado en base de datos.
   * @returns `true` si coinciden.
   */
  compare(plain: string, hashed: string): Promise<boolean>;
}
