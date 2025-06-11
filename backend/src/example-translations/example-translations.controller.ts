import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ExampleTranslationsService } from './example-translations.service';
import { CreateExampleTranslationDto, UpdateExampleTranslationDto } from './dto/example-translation.dto';

@Controller('example-translations')
export class ExampleTranslationsController {
  constructor(private readonly exampleTranslationsService: ExampleTranslationsService) {}

  @Post(':exampleId')
  async createExampleTranslation(
    @Param('exampleId') exampleId: string,
    @Body() data: CreateExampleTranslationDto
  ) {
    return this.exampleTranslationsService.createExampleTranslation(exampleId, data);
  }

  @Put(':id')
  async updateExampleTranslation(
    @Param('id') id: string,
    @Body() data: UpdateExampleTranslationDto
  ) {
    return this.exampleTranslationsService.updateExampleTranslation(id, data);
  }

  @Delete(':id')
  async deleteExampleTranslation(@Param('id') id: string) {
    return this.exampleTranslationsService.deleteExampleTranslation(id);
  }
} 