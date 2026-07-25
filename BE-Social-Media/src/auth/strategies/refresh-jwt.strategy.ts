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
  constructor(
    private authService: AuthService,
    @Inject(refresh_tokenJwtConfig.KEY)
    private refreshTokenJwtConfig: ConfigType<typeof refresh_tokenJwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.['refreshToken'] || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshTokenJwtConfig.secret || 'super_secret_jwt_refresh_token_key_2026',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const reqAny = req as any;
    const oldRt = reqAny.cookies?.['refreshToken'] || reqAny.body?.refreshToken;
    const newTokens = await this.authService.rotateRefreshToken(oldRt);

    return {
      newTokens,
      ...payload,
    };
  }
}
