import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'refresh-jwt',
  (): JwtModuleOptions => ({
    secret: process.env.REFRESH_JWT_SECRET || 'super_secret_jwt_refresh_token_key_2026',
    signOptions: {
      expiresIn: Number(process.env.REFRESH_JWT_EXPIRED_TIME || 604800),
    },
  }),
);