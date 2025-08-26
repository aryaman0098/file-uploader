import { 
  createParamDecorator, 
  ExecutionContext 
} from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    return request.user?.uid
  },
);

export const CurrentUserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    return request.user?.email
  },
)