// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { MongoDBService } from '../mongodb/mongodb.service';
import { User, Role } from '../../types/database';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly mongodb: MongoDBService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Find user by email
    const user = await this.mongodb.users.findOne({ email });
    
    if (!user) {
      return null;
    }
    
    // Check password
    const isPasswordValid = await argon2.verify(user.password, password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Format the document and remove password
    const formattedUser = this.mongodb.formatDocument<User>(user);
    const { password: _, ...result } = formattedUser;
    
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role
    };
    
    // Generate refresh token
    const refreshToken = randomBytes(40).toString('hex');
    const accessToken = this.jwtService.sign(payload);
    
    // Update user with new tokens
    await this.mongodb.users.updateOne(
      { _id: this.mongodb.toObjectId(user.id) },
      {
        $set: {
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      }
    );
    
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

  async register(userData: { username: string; email: string; password: string; role?: Role }) {
    // Check if username already exists
    const existingUsername = await this.mongodb.users.findOne({ username: userData.username });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }
    
    // Check if email already exists
    const existingEmail = await this.mongodb.users.findOne({ email: userData.email });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    
    // Hash the password
    const hashedPassword = await argon2.hash(userData.password);
    
    // Create the user document
    const userDoc = {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || Role.USER,
      createdAt: new Date(),
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null
    };
    
    // Insert into database
    const result = await this.mongodb.users.insertOne(
      this.mongodb.prepareDocumentForDB(userDoc)
    );
    
    // Return the created user (without password)
    const createdUser = this.mongodb.formatDocument<User>({
      ...userDoc,
      _id: result.insertedId
    });
    
    const { password: _, ...userWithoutPassword } = createdUser;
    
    return userWithoutPassword;
  }

  async getProfile(userId: string) {
    // Convert string ID to ObjectId
    const objectId = this.mongodb.toObjectId(userId);
    
    // Find the user
    const user = await this.mongodb.users.findOne({ _id: objectId });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Format the document and remove the password
    const formattedUser = this.mongodb.formatDocument<User>(user);
    const { password: _, ...userWithoutPassword } = formattedUser;
    
    return userWithoutPassword;
  }

  async refreshTokens(refreshToken: string) {
    // Find user with the refresh token
    const user = await this.mongodb.users.findOne({ refreshToken });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    // Check if token is expired
    if (new Date() > user.tokenExpiresAt) {
      // Clear expired tokens
      await this.mongodb.users.updateOne(
        { _id: user._id },
        {
          $set: {
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null
          }
        }
      );
      throw new UnauthorizedException('Refresh token expired');
    }
    
    const formattedUser = this.mongodb.formatDocument<User>(user);
    // Generate new tokens
    const payload = {
      email: formattedUser.email,
      sub: formattedUser.id,
      role: formattedUser.role
    };
    
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = randomBytes(40).toString('hex');
    
    // Update user with new tokens
    await this.mongodb.users.updateOne(
      { _id: user._id },
      {
        $set: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      }
    );
    
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    };
  }

  async logout(userId: string) {
    // Clear tokens from user document
    await this.mongodb.users.updateOne(
      { _id: this.mongodb.toObjectId(userId) },
      {
        $set: {
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null
        }
      }
    );
    return { message: 'Logged out successfully' };
  }
}
