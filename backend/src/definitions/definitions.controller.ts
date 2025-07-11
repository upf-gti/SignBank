import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DefinitionsService } from './definitions.service';
import { CreateDefinitionDto, UpdateDefinitionDto, UpdateDefinitionTranslationDto, CreateDefinitionTranslationDto } from './dto/definition.dto';

@Controller('definitions')
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Post('sense/:senseId')
  async createDefinition(
    @Param('senseId') senseId: string,
    @Body() data: CreateDefinitionDto
  ) {
    return this.definitionsService.createDefinition(senseId, data);
  }

  @Put('sense/:senseId/:definitionId')
  async updateDefinition(
    @Param('senseId') senseId: string,
    @Param('definitionId') definitionId: string,
    @Body() data: UpdateDefinitionDto
  ) {
    return this.definitionsService.updateDefinition(senseId, definitionId, data);
  }

  @Delete('sense/:senseId/:definitionId')
  async deleteDefinition(
    @Param('senseId') senseId: string,
    @Param('definitionId') definitionId: string
  ) {
    return this.definitionsService.deleteDefinition(senseId, definitionId);
  }

  @Delete('sense/:senseId/:definitionId/video')
  async deleteDefinitionVideo(
    @Param('senseId') senseId: string,
    @Param('definitionId') definitionId: string
  ) {
    return this.definitionsService.deleteDefinitionVideo(senseId, definitionId);
  }

  @Post(':definitionId/translations')
  async createDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Body() data: CreateDefinitionTranslationDto
  ) {
    return this.definitionsService.createDefinitionTranslation(definitionId, data);
  }

  @Put(':definitionId/translations/:translationId')
  async updateDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Param('translationId') translationId: string,
    @Body() data: UpdateDefinitionTranslationDto
  ) {
    return this.definitionsService.updateDefinitionTranslation(definitionId, translationId, data);
  }

  @Delete(':definitionId/translations/:translationId')
  async deleteDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Param('translationId') translationId: string
  ) {
    return this.definitionsService.deleteDefinitionTranslation(definitionId, translationId);
  }
} 