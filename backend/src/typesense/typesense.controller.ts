import { Controller, Post, Get } from '@nestjs/common';
import { TypesenseService } from './typesense.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('typesense')
@Controller('typesense')
export class TypesenseController {
  constructor(private readonly typesenseService: TypesenseService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync all videos to Typesense' })
  async syncAllVideos() {
    return this.typesenseService.syncAllVideos();
  }

  @Post('sync/init')
  @ApiOperation({ summary: 'Initialize or reset Typesense collection' })
  async initializeCollection() {
    return this.typesenseService.initializeCollection();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Typesense collection status' })
  async getStatus() {
    return this.typesenseService.getCollectionStatus();
  }
} 