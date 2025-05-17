// src/auth/auth.controller.ts
import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guard/jwt.guard';
import { GetUser } from './decorator/get-user.decorator';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: { username: string; email: string; password: string }) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Body() body: { refresh_token: string }) {
    return this.authService.refreshTokens(body.refresh_token);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@GetUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
