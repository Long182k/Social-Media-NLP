import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import 'dotenv/config';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import refresh_tokenJwtConfig from '../@config/refresh_token-jwt.config';
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
      secretOrKey: refreshTokenJwtConfig.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const oldRt = req.cookies?.['refreshToken'] || req.body.refreshToken;
    const newTokens = await this.authService.rotateRefreshToken(oldRt);

    return {
      newTokens,
      ...payload,
    };
  }
}
