/**
 * @file jwt.strategy.ts
 * @description Estrategia Passport para validar JWT en requests HTTP.
 *
 * Capa: **Infrastructure**.
 * Extrae el token del header `Authorization: Bearer ...`, valida la firma
 * y la expiración, y poblá `req.user` con los datos del payload.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Estructura del payload firmado en los tokens JWT.
 *
 * @property sub      ID del usuario (subject estándar de JWT).
 * @property username Username del usuario (claim custom para conveniencia).
 */
export interface JwtPayload {
  sub: string;
  username: string;
}

/**
 * Estrategia "jwt" registrada en Passport.
 *
 * Es invocada automáticamente por `JwtAuthGuard` en endpoints protegidos.
 * Si el token es válido, el resultado de `validate()` queda disponible
 * como `req.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      // Extrae el token del header HTTP estándar
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Rechaza tokens expirados
      ignoreExpiration: false,
      // Secret simétrico para verificar la firma HS256
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  /**
   * Se ejecuta tras validar la firma y la expiración del token.
   *
   * El objeto retornado se asigna a `req.user`. Mapeamos `sub -> userId`
   * para que los controllers usen un nombre más descriptivo.
   */
  async validate(payload: JwtPayload) {
    return { userId: payload.sub, username: payload.username };
  }
}
