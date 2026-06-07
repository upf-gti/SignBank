import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TypesenseService } from './typesense.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('typesense')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class TypesenseController {
  constructor(private readonly typesenseService: TypesenseService) {}

  @Post('sync')
  async syncAllVideos() {
    return this.typesenseService.syncAllVideos();
  }

  @Post('sync/init')
  async ensureCollection() {
    return this.typesenseService.ensureCollectionExists();
  }

  @Post('sync/recreate')
  async recreateCollection() {
    await this.typesenseService.recreateCollection();
    return this.typesenseService.syncAllVideos();
  }

  @Get('status')
  async getStatus() {
    return this.typesenseService.getCollectionStatus();
  }
}
