import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestUser = {
  userId: string;
  email: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser => {
    const request = context.switchToHttp().getRequest();
    return request.user as RequestUser;
  },
);
