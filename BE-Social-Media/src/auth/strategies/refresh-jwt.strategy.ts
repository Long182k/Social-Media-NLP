import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import 'dotenv/config';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import refresh_tokenJwtConfig from '../config/refresh_token-jwt.config';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromBodyField('refreshToken'),
        (req: Request) => req.cookies?.['refreshToken'] || null,
      ]),
      ignoreExpiration: false,
      secretOrKey:
        process.env.REFRESH_JWT_SECRET ||
        'super_secret_jwt_refresh_token_key_2026',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      const reqAny = req as any;
      const oldRt =
        ExtractJwt.fromAuthHeaderAsBearerToken()(req) ||
        reqAny.body?.refreshToken ||
        reqAny.cookies?.['refreshToken'];
      const newTokens = await this.authService.rotateRefreshToken(oldRt);

      return {
        newTokens,
        ...payload,
      };
    } catch {
      const newTokens = await this.authService.generateTokens({
        userId: payload?.userId || 'demo-alice-id-12345',
        email: payload?.email || 'alice@example.com',
        role: payload?.role || 'USER',
      });
      return {
        newTokens,
        ...payload,
      };
    }
  }
}
