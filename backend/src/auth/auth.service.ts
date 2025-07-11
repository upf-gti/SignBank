// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { User, Role } from '@prisma/client'; // Use Prisma's generated types

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) return null;
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role
    };
    const refreshToken = randomBytes(40).toString('hex');
    const accessToken = this.jwtService.sign(payload);

    await this.users.update(user.id, {
      accessToken,
      refreshToken
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(userData: { username: string; email: string; password: string; role?: Role; name?: string; lastName?: string }) {
    if (await this.users.findByUsername(userData.username)) {
      throw new ConflictException('Username already exists');
    }
    if (await this.users.findByEmail(userData.email)) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await argon2.hash(userData.password);
    const user = await this.users.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || Role.USER,
      name: userData.name,
      lastName: userData.lastName,
      createdAt: new Date()
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfile(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refreshTokens(refreshToken: string) {
    // Check if refresh token exists and has valid format
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.length !== 80) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    // Find user with the provided refresh token
    const user = await this.users.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Invalidate old tokens immediately for security
    await this.users.update(user.id, {
      accessToken: null,
      refreshToken: null,
    });

    // Generate new tokens
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role
    };
    
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = randomBytes(40).toString('hex');
    
    // Update user with new tokens
    await this.users.update(user.id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    };
  }

  async logout(userId: string) {
    await this.users.update(userId, {
      accessToken: null,
      refreshToken: null,
    });
    return { message: 'Logged out successfully' };
  }
}
