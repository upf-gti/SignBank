import { Controller, Get, Param } from '@nestjs/common';
import { GlossesService } from './glosses.service';

@Controller('glosses')
export class GlossesController {
  constructor(private readonly glossesService: GlossesService) {}

  @Get(':id')
  async getGlossById(@Param('id') id: string) {
    debugger
    return this.glossesService.getGlossById(id);
  }
} 