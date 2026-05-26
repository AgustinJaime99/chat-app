/**
 * @file bcrypt-password-hasher.ts
 * @description Implementación de `IPasswordHasher` basada en bcrypt.
 *
 * Capa: **Infrastructure**.
 * Usa 10 rounds de coste por defecto (~100ms por hash en hardware moderno).
 * Para producción se puede subir a 12 si el throughput lo permite.
 */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/services/password-hasher';

/**
 * Hasher de contraseñas usando bcrypt.
 *
 * El salt se genera automáticamente y queda embebido en el hash resultante,
 * por lo que no es necesario almacenarlo por separado.
 */
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  /** Factor de coste (work factor). 10 = 2^10 iteraciones. */
  private readonly rounds = 10;

  /** @inheritdoc */
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  /** @inheritdoc */
  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
