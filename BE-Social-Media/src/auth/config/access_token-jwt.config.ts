import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET || 'super_secret_jwt_access_token_key_2026',
    signOptions: {
      expiresIn: Number(process.env.JWT_EXPIRED_TIME || 86400),
    },
  }),
);
