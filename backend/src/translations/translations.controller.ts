import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { CreateTranslationDto, UpdateTranslationDto } from './dto/translation.dto';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post('sense/:senseId')
  async createSenseTranslation(
    @Param('senseId') senseId: string,
    @Body() data: CreateTranslationDto
  ) {
    return this.translationsService.createSenseTranslation(senseId, data);
  }

  @Put('sense/:id')
  async updateSenseTranslation(
    @Param('id') id: string,
    @Body() data: UpdateTranslationDto
  ) {
    return this.translationsService.updateSenseTranslation(id, data);
  }

  @Delete('sense/:id')
  async deleteSenseTranslation(@Param('id') id: string) {
    return this.translationsService.deleteSenseTranslation(id);
  }
} 