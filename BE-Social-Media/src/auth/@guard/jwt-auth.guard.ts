import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../@decorator/public.decorator';
import { IS_REFRESH_TOKEN_KEY } from '../@decorator/refreshToken.decorator';
import 'dotenv/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();

    // REST fallback
    const request = gqlContext.req || context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isRefreshAuthGuard = this.reflector.getAllAndOverride<boolean>(
      IS_REFRESH_TOKEN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic || isRefreshAuthGuard) return true;

    // 🟢 NEW: Extract token from WebSocket `connectionParams` OR HTTP headers
    const token =
      this.extractTokenFromConnection(gqlContext) ||
      this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Missing Bearer tokenzzzzzzz');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = payload;
      gqlContext.user = payload; // important for subscriptions
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader =
      request?.headers?.authorization || request?.headers?.Authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromConnection(context: any): string | undefined {
    // ✅ Check multiple possible paths for connectionParams
    const params =
      context?.connectionParams ||
      context?.req?.connectionParams ||
      context?.extra?.connectionParams ||
      context?.req?.extra?.connectionParams ||
      {};

    const token =
      params.Authorization ||
      params.authorization ||
      params.authToken ||
      params.token;

    if (!token) return undefined;

    const [type, realToken] = token.split(' ');

    return type === 'Bearer' ? realToken : undefined;
  }
}
