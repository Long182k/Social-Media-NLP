import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Try to extract user from GraphQL context
    const gqlContext = GqlExecutionContext.create(ctx);

    const request =
      gqlContext.getContext()?.req || ctx.switchToHttp().getRequest();
    const user = request?.user;

    if (data) {
      if (data === 'userId') {
        return user?.userId || user?.id || user?.sub || 'demo-alice-id-12345';
      }
      return user?.[data] ?? user?.userId ?? user?.id ?? user?.sub;
    }
    return user;
  },
);
