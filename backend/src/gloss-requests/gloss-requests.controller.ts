import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GlossRequestsService } from './gloss-requests.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Controller('gloss-requests')
@UseGuards(JwtGuard, RolesGuard)
export class GlossRequestsController {
  constructor(private readonly glossRequestsService: GlossRequestsService) {}

  @Get('pending')
  @Roles(Role.ADMIN)
  async getAllPendingRequests() {
    return this.glossRequestsService.getAllPendingRequests();
  }

  @Get('my-requests')
  async getUserRequests(@Request() req) {
    return this.glossRequestsService.getUserRequests(req.user.id);
  }
} 