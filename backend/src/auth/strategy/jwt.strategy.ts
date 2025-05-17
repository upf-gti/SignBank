// src/auth/strategy/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../../types/database';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'super-secret',
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      // Find the user by ID from the token payload
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      return {
        ...userWithoutPassword,
        userId: userWithoutPassword.id, // Include this for backward compatibility
      };
    } catch (error) {
      console.error('JwtStrategy: Error during validation:', error);
      throw error;
    }
  }
}
