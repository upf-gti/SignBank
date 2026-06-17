import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { CreateTranslationDto, UpdateTranslationDto } from './dto/translation.dto';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post('gloss/:glossDataId')
  async createGlossTranslation(
    @Param('glossDataId') glossDataId: string,
    @Body() data: CreateTranslationDto,
  ) {
    return this.translationsService.createGlossTranslation(glossDataId, data);
  }

  @Put(':id')
  async updateGlossTranslation(
    @Param('id') id: string,
    @Body() data: UpdateTranslationDto,
  ) {
    return this.translationsService.updateGlossTranslation(id, data);
  }

  @Delete(':id')
  async deleteGlossTranslation(@Param('id') id: string) {
    return this.translationsService.deleteGlossTranslation(id);
  }
}
