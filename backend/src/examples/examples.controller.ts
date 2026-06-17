import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ExamplesService } from './examples.service';
import { CreateExampleDto, UpdateExampleDto } from './dto/example.dto';

@Controller('examples')
export class ExamplesController {
  constructor(private readonly examplesService: ExamplesService) {}

  @Post('gloss/:glossDataId')
  async createExample(
    @Param('glossDataId') glossDataId: string,
    @Body() data: CreateExampleDto
  ) {
    return this.examplesService.createExample(glossDataId, data);
  }

  @Put(':id')
  async updateExample(
    @Param('id') id: string,
    @Body() data: UpdateExampleDto
  ) {
    return this.examplesService.updateExample(id, data);
  }

  @Delete(':id')
  async deleteExample(@Param('id') id: string) {
    return this.examplesService.deleteExample(id);
  }

  @Delete(':id/video')
  async deleteExampleVideo(@Param('id') id: string) {
    return this.examplesService.deleteExampleVideo(id);
  }
} 