import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Environment } from '../../../config/environment';
import { AuthService } from '../auth.service';
import type { AuthenticatedUser } from '../user.type';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<Environment, true>,
    private readonly authService: AuthService,
  ) {
    const supabaseUrl = config.get('SUPABASE_URL', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Supabase signe ses access tokens en ES256 via des clés asymétriques.
      // On récupère la clé publique correspondante depuis le JWKS du projet.
      algorithms: ['ES256'],
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
      }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) throw new UnauthorizedException();

    const user = await this.authService.getUserProfile(
      payload.sub,
      payload.email,
    );
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
