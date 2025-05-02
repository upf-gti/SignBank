// src/auth/strategy/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MongoDBService } from '../../mongodb/mongodb.service';
import { User } from '../../../types/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly mongodb: MongoDBService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: any) {
    const objectId = this.mongodb.toObjectId(payload.sub);
    
    // Find the user by ID from the token payload
    const user = await this.mongodb.users.findOne({ _id: objectId });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Format the document and remove sensitive data
    const formattedUser = this.mongodb.formatDocument<User>(user);
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = formattedUser;
    
    return {
      ...userWithoutPassword,
      userId: userWithoutPassword.id, // Include this for backward compatibility
    };
  }
}
