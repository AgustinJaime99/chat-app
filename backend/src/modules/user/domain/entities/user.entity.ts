/**
 * @file user.entity.ts
 * @description Entidad de dominio que representa un usuario.
 *
 * Capa: **Domain** (Clean Architecture).
 * Es totalmente independiente de Prisma, NestJS y cualquier framework.
 * Sus campos son inmutables (`readonly`) para evitar mutaciones accidentales.
 */

/**
 * Representa a un usuario del sistema.
 *
 * @property id        Identificador único (UUID).
 * @property email     Email único, usado para login alternativo.
 * @property username  Nombre de usuario único, usado para identificación pública.
 * @property password  Hash bcrypt de la contraseña (nunca el texto plano).
 * @property createdAt Fecha de creación del registro.
 * @property updatedAt Fecha de la última actualización.
 */
export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method para construir una `UserEntity` a partir de datos parciales.
   *
   * Si no se proveen `createdAt` o `updatedAt`, se usa la fecha actual.
   * Útil para mapear filas de Prisma a entidades de dominio.
   *
   * @param props Propiedades del usuario.
   * @returns Una nueva instancia de `UserEntity`.
   */
  static create(props: {
    id: string;
    email: string;
    username: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserEntity {
    const now = new Date();
    return new UserEntity(
      props.id,
      props.email,
      props.username,
      props.password,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }
}
