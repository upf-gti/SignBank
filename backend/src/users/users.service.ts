import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    // Remove sensitive information before returning
    return users.map(user => {
      const { password, accessToken, refreshToken, ...userWithoutSensitiveData } = user;
      return userWithoutSensitiveData;
    });
  }

  async updateUserRole(userId: string, newRole: Role) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If trying to demote an admin to user, check if they're the last admin
    if (user.role === Role.ADMIN && newRole === Role.USER) {
      const adminCount = await this.userRepository.countByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot demote the last admin user');
      }
    }

    const updatedUser = await this.userRepository.update(userId, { role: newRole });
    const { password, accessToken, refreshToken, ...userWithoutSensitiveData } = updatedUser;
    return userWithoutSensitiveData;
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting the last admin user
    if (user.role === Role.ADMIN) {
      const adminCount = await this.userRepository.countByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last admin user');
      }
    }

    // Instead of actually deleting, we'll mark the user as inactive
    // For now, we'll just delete the user, but in a real application
    // you might want to add an 'active' field to the User model
    const deletedUser = await this.userRepository.delete(userId);
    const { password, accessToken, refreshToken, ...userWithoutSensitiveData } = deletedUser;
    return userWithoutSensitiveData;
  }

  async changePassword(userId: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await argon2.hash(newPassword);
    const updatedUser = await this.userRepository.update(userId, { password: hashedPassword });
    const { password, accessToken, refreshToken, ...userWithoutSensitiveData } = updatedUser;
    return userWithoutSensitiveData;
  }
} 