import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DefinitionsService } from './definitions.service';
import { CreateDefinitionDto, UpdateDefinitionDto, UpdateDefinitionTranslationDto, CreateDefinitionTranslationDto } from './dto/definition.dto';

@Controller('definitions')
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Post('gloss/:glossDataId')
  async createDefinition(
    @Param('glossDataId') glossDataId: string,
    @Body() data: CreateDefinitionDto,
  ) {
    return this.definitionsService.createDefinition(glossDataId, data);
  }

  @Put('gloss/:glossDataId/:definitionId')
  async updateDefinition(
    @Param('glossDataId') glossDataId: string,
    @Param('definitionId') definitionId: string,
    @Body() data: UpdateDefinitionDto,
  ) {
    return this.definitionsService.updateDefinition(glossDataId, definitionId, data);
  }

  @Delete('gloss/:glossDataId/:definitionId')
  async deleteDefinition(
    @Param('glossDataId') glossDataId: string,
    @Param('definitionId') definitionId: string,
  ) {
    return this.definitionsService.deleteDefinition(glossDataId, definitionId);
  }

  @Delete('gloss/:glossDataId/:definitionId/video')
  async deleteDefinitionVideo(
    @Param('glossDataId') glossDataId: string,
    @Param('definitionId') definitionId: string,
  ) {
    return this.definitionsService.deleteDefinitionVideo(glossDataId, definitionId);
  }

  @Post(':definitionId/translations')
  async createDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Body() data: CreateDefinitionTranslationDto,
  ) {
    return this.definitionsService.createDefinitionTranslation(definitionId, data);
  }

  @Put(':definitionId/translations/:translationId')
  async updateDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Param('translationId') translationId: string,
    @Body() data: UpdateDefinitionTranslationDto,
  ) {
    return this.definitionsService.updateDefinitionTranslation(definitionId, translationId, data);
  }

  @Delete(':definitionId/translations/:translationId')
  async deleteDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Param('translationId') translationId: string,
  ) {
    return this.definitionsService.deleteDefinitionTranslation(definitionId, translationId);
  }
}
