// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { MongoDBService } from '../mongodb/mongodb.service';
import { User, Role } from '../../types/database';

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
    
    return {
      access_token: this.jwtService.sign(payload),
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
      createdAt: new Date()
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
}
