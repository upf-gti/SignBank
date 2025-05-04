// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtGuard } from './guard/jwt.guard';

@Module({
  imports: [
    PassportModule.register({ 
      defaultStrategy: 'jwt',
      session: false 
    }),
    JwtModule.register({
      secret: 'super-secret', // Match the secret key in JwtStrategy
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtGuard],
  controllers: [AuthController],
  exports: [JwtGuard, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
