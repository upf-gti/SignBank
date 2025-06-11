// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtGuard } from './guard/jwt.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from '../repositories/user.repository';

@Module({
  imports: [
    PassportModule.register({ 
      defaultStrategy: 'jwt',
      session: false 
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '15m' }, // Access tokens expire in 15 minutes
    }),
    PrismaModule,
  ],
  providers: [AuthService, JwtStrategy, JwtGuard, UserRepository],
  controllers: [AuthController],
  exports: [JwtGuard, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
