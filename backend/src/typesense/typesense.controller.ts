import { Controller, Post, Get } from '@nestjs/common';
import { TypesenseService } from './typesense.service';

@Controller('typesense')
export class TypesenseController {
  constructor(private readonly typesenseService: TypesenseService) {}

  @Post('sync')
  async syncAllVideos() {
    return this.typesenseService.syncAllVideos();
  }

  @Post('sync/init')
  async initializeCollection() {
    return this.typesenseService.initializeCollection();
  }

  @Get('status')
  async getStatus() {
    return this.typesenseService.getCollectionStatus();
  }
} 