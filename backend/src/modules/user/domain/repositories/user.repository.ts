/**
 * @file user.repository.ts
 * @description Contrato (puerto) del repositorio de usuarios.
 *
 * Capa: **Domain**.
 * Aplica el principio de inversión de dependencias (DIP): la capa de
 * aplicación depende de esta interfaz, no de la implementación concreta
 * (`UserPrismaRepository`).
 */
import { UserEntity } from '../entities/user.entity';

/**
 * Token de inyección de dependencias para el repositorio de usuarios.
 *
 * Se usa como `@Inject(USER_REPOSITORY)` en lugar del nombre de clase
 * para mantener el desacople entre dominio e infraestructura.
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * Define las operaciones de persistencia disponibles para `UserEntity`.
 *
 * Cualquier implementación (Prisma, MongoDB, en memoria, etc.) debe
 * cumplir este contrato.
 */
export interface IUserRepository {
  /** Busca un usuario por su ID. Retorna `null` si no existe. */
  findById(id: string): Promise<UserEntity | null>;

  /** Busca un usuario por su email. Retorna `null` si no existe. */
  findByEmail(email: string): Promise<UserEntity | null>;

  /** Busca un usuario por su username. Retorna `null` si no existe. */
  findByUsername(username: string): Promise<UserEntity | null>;

  /**
   * Crea un nuevo usuario.
   * @param data Datos del usuario; `password` debe llegar ya hasheado.
   */
  create(data: { email: string; username: string; password: string }): Promise<UserEntity>;
}
