/**
 * @file jwt-auth.guard.ts
 * @description Guard HTTP que delega en la estrategia "jwt" de Passport.
 *
 * Aplicado con `@UseGuards(JwtAuthGuard)` a un controller o método para
 * exigir un access token válido. Si falla, NestJS responde con 401.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rutas HTTP requiriendo un JWT válido en `Authorization`.
 *
 * El nombre `'jwt'` debe coincidir con el segundo argumento de
 * `PassportStrategy(Strategy, 'jwt')` en `JwtStrategy`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
