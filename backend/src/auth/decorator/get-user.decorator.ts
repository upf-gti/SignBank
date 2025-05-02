// src/auth/decorator/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // If no specific data is requested, return the entire user object
    if (!data) {
      return request.user;
    }
    
    // Return the specific property requested
    return request.user[data];
  },
);
