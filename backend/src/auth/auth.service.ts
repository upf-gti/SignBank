// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Find user
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Generate token
    return this.signToken(user.id, user.email, user.role);
  }
  
  async signToken(userId: number, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };
  
    return {
      access_token: await this.jwt.signAsync(payload),
      role, // Include role in response
    };
  }

  async register(username: string, email: string, password: string) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return this.signToken(user.id, user.email, user.role);
  }
}
