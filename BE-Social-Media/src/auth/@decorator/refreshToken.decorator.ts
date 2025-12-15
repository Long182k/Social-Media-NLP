import { SetMetadata } from '@nestjs/common';

export const IS_REFRESH_TOKEN_KEY = 'isRefreshAuthGuard';
export const RefreshToken = () => SetMetadata(IS_REFRESH_TOKEN_KEY, true);