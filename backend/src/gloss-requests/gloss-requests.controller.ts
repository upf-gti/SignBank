import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { GlossRequestsService } from './gloss-requests.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { CreateGlossRequestDto } from './dto/create-gloss-request.dto';
// import { AcceptGlossRequestDto } from './dto/accept-gloss-request.dto';
import { DeclineGlossRequestDto } from './dto/decline-gloss-request.dto';

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
  // No @Roles decorator needed since we just need authentication via JwtGuard
  async getUserRequests(@Request() req) {
    return this.glossRequestsService.getUserRequests(req.user.id);
  }

  @Get(':id')
  async getGlossRequest(@Param('id') id: string) {
    return this.glossRequestsService.getGlossRequest(id);
  }

  @Post()
  async createGlossRequest(
    @Request() req,
    @Body() createGlossRequestDto: CreateGlossRequestDto,
  ) {
    return this.glossRequestsService.createGlossRequest(
      req.user.id,
      createGlossRequestDto,
    );
  }

  @Post(':id/accept')
  @Roles(Role.ADMIN)
  async acceptGlossRequest(
    @Request() req,
    @Param('id') id: string,
    // @Body() acceptGlossRequestDto: AcceptGlossRequestDto,
  ) {
    return this.glossRequestsService.acceptGlossRequest(
      id,
      req.user.id,
      // acceptGlossRequestDto,
    );
  }

  @Post(':id/decline')
  @Roles(Role.ADMIN)
  async declineGlossRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() declineGlossRequestDto: DeclineGlossRequestDto,
  ) {
    return this.glossRequestsService.declineGlossRequest(
      id,
      req.user.id,
      declineGlossRequestDto,
    );
  }
} 