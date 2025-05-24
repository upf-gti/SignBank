import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Call the parent class's canActivate method to validate the JWT
    const canActivate = await super.canActivate(context);
    
    if (!canActivate) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw an error
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token or user not found');
    }

    // Ensure the user has a role
    if (!user.role || !Object.values(Role).includes(user.role)) {
      throw new UnauthorizedException('User has no valid role assigned');
    }

    return user;
  }
}