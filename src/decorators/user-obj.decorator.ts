import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserObj = createParamDecorator(
  (data, context: ExecutionContext) => {
    console.log(context.switchToHttp().getRequest().cookies);

    return context.switchToHttp().getRequest().user;
  },
);
