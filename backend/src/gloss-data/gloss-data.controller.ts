import { Controller, Get, Post, Put, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GlossDataService } from './gloss-data.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role, Language } from '@prisma/client';
import { UpdateDefinitionDto, UpdateDefinitionTranslationDto } from './dto/update-definition.dto';
import { UpdateCompoundDto } from './dto/update-compound.dto';

@Controller('gloss-data')
@UseGuards(JwtGuard, RolesGuard)
export class GlossDataController {
  constructor(private readonly glossDataService: GlossDataService) {}

  @Get(':id')
  async getGlossData(@Param('id') id: string) {
    return this.glossDataService.getGlossData(id);
  }

  @Patch(':id/gloss')
  @Roles(Role.ADMIN)
  async updateGloss(@Param('id') id: string, @Body() data: { gloss: string }) {
    return this.glossDataService.updateGloss(id, data.gloss);
  }

  @Patch(':id/archive')
  @Roles(Role.ADMIN)
  async archiveGloss(@Param('id') id: string) {
    return this.glossDataService.archiveGloss(id);
  }

  @Patch(':id/unarchive')
  @Roles(Role.ADMIN)
  async unarchiveGloss(@Param('id') id: string) {
    return this.glossDataService.unarchiveGloss(id);
  }

  @Delete('examples/:id')
  @Roles(Role.ADMIN)
  async deleteExample(@Param('id') id: string) {
    return this.glossDataService.deleteExample(id);
  }

  @Delete('sign-videos/:id')
  @Roles(Role.ADMIN)
  async deleteSignVideo(@Param('id') id: string) {
    return this.glossDataService.deleteSignVideo(id);
  }

  @Delete('videos/:id')
  @Roles(Role.ADMIN)
  async deleteVideo(@Param('id') id: string) {
    return this.glossDataService.deleteVideo(id);
  }

  @Delete('video-data/:id')
  @Roles(Role.ADMIN)
  async deleteVideoData(@Param('id') id: string) {
    return this.glossDataService.deleteVideoData(id);
  }

  @Delete('gloss-translations/:id')
  @Roles(Role.ADMIN)
  async deleteGlossTranslation(@Param('id') id: string) {
    return this.glossDataService.deleteGlossTranslation(id);
  }

  @Delete('definition-translations/:id')
  @Roles(Role.ADMIN)
  async deleteDefinitionTranslation(@Param('id') id: string) {
    return this.glossDataService.deleteDefinitionTranslation(id);
  }

  @Delete('example-translations/:id')
  @Roles(Role.ADMIN)
  async deleteExampleTranslation(@Param('id') id: string) {
    return this.glossDataService.deleteExampleTranslation(id);
  }

  @Post(':id/relations')
  @Roles(Role.ADMIN)
  async createRelation(
    @Param('id') glossId: string,
    @Body() data: { targetGlossId: string; relationType: string },
  ) {
    return this.glossDataService.createRelation(glossId, data.targetGlossId, data.relationType);
  }

  @Patch('relations/:relationId')
  @Roles(Role.ADMIN)
  async updateRelation(
    @Param('relationId') relationId: string,
    @Body() data: { relationType: string },
  ) {
    return this.glossDataService.updateRelation(relationId, data.relationType);
  }

  @Delete('relations/:relationId')
  @Roles(Role.ADMIN)
  async deleteRelatedGloss(@Param('relationId') relationId: string) {
    return this.glossDataService.deleteRelatedGloss(relationId);
  }

  @Post(':id/minimal-pairs')
  @Roles(Role.ADMIN)
  async createMinimalPair(
    @Param('id') glossId: string,
    @Body() data: { targetGlossId: string; distinction: string },
  ) {
    return this.glossDataService.createMinimalPair(glossId, data.targetGlossId, data.distinction);
  }

  @Patch('minimal-pairs/:pairId')
  @Roles(Role.ADMIN)
  async updateMinimalPair(
    @Param('pairId') pairId: string,
    @Body() data: { distinction: string },
  ) {
    return this.glossDataService.updateMinimalPair(pairId, data.distinction);
  }

  @Delete('minimal-pairs/:pairId')
  @Roles(Role.ADMIN)
  async deleteMinimalPair(@Param('pairId') pairId: string) {
    return this.glossDataService.deleteMinimalPair(pairId);
  }

  @Post(':glossDataId/definitions')
  @Roles(Role.ADMIN)
  async createDefinition(
    @Param('glossDataId') glossDataId: string,
    @Body() data: UpdateDefinitionDto,
  ) {
    return this.glossDataService.createDefinition(glossDataId, data);
  }

  @Patch(':glossDataId/definitions/:definitionId')
  @Roles(Role.ADMIN)
  async updateDefinition(
    @Param('glossDataId') glossDataId: string,
    @Param('definitionId') definitionId: string,
    @Body() data: UpdateDefinitionDto,
  ) {
    return this.glossDataService.updateDefinition(glossDataId, definitionId, data);
  }

  @Delete(':glossDataId/definitions/:definitionId')
  @Roles(Role.ADMIN)
  async deleteDefinition(
    @Param('glossDataId') glossDataId: string,
    @Param('definitionId') definitionId: string,
  ) {
    return this.glossDataService.deleteDefinition(glossDataId, definitionId);
  }

  @Patch('definitions/:definitionId/translations/:translationId')
  @Roles(Role.ADMIN)
  async updateDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Param('translationId') translationId: string,
    @Body() data: UpdateDefinitionTranslationDto,
  ) {
    return this.glossDataService.updateDefinitionTranslation(definitionId, translationId, data);
  }

  @Post(':glossDataId/translations')
  @Roles(Role.ADMIN)
  async createGlossTranslation(
    @Param('glossDataId') glossDataId: string,
    @Body() data: { translation: string; language: Language },
  ) {
    return this.glossDataService.createGlossTranslation(glossDataId, data);
  }

  @Patch('gloss-translations/:id')
  @Roles(Role.ADMIN)
  async updateGlossTranslation(
    @Param('id') id: string,
    @Body() data: { translation: string; language: Language },
  ) {
    return this.glossDataService.updateGlossTranslation(id, data);
  }

  @Post(':glossDataId/examples')
  @Roles(Role.ADMIN)
  async createExample(
    @Param('glossDataId') glossDataId: string,
    @Body() data: { example: string; exampleVideoURL: string },
  ) {
    return this.glossDataService.createExample(glossDataId, data);
  }

  @Patch('examples/:id')
  @Roles(Role.ADMIN)
  async updateExample(
    @Param('id') id: string,
    @Body() data: { example: string; exampleVideoURL: string },
  ) {
    return this.glossDataService.updateExample(id, data);
  }

  @Post('examples/:exampleId/translations')
  @Roles(Role.ADMIN)
  async createExampleTranslation(
    @Param('exampleId') exampleId: string,
    @Body() data: { translation: string; language: Language },
  ) {
    return this.glossDataService.createExampleTranslation(exampleId, data);
  }

  @Patch('example-translations/:id')
  @Roles(Role.ADMIN)
  async updateExampleTranslation(
    @Param('id') id: string,
    @Body() data: { translation: string; language: Language },
  ) {
    return this.glossDataService.updateExampleTranslation(id, data);
  }

  @Patch('sign-videos/:signVideoId/priority')
  @Roles(Role.ADMIN)
  async updateSignVideoPriority(
    @Param('signVideoId') signVideoId: string,
    @Body() data: { priority: number },
  ) {
    return this.glossDataService.updateSignVideoPriority(signVideoId, data.priority);
  }

  @Post(':glossDataId/sign-videos/reorder')
  @Roles(Role.ADMIN)
  async reorderSignVideos(
    @Param('glossDataId') glossDataId: string,
    @Body() data: { signVideoIds: string[] },
  ) {
    return this.glossDataService.reorderSignVideos(glossDataId, data.signVideoIds);
  }

  @Patch('videos/:videoId/priority')
  @Roles(Role.ADMIN)
  async updateVideoPriority(
    @Param('videoId') videoId: string,
    @Body() data: { priority: number },
  ) {
    return this.glossDataService.updateVideoPriority(videoId, data.priority);
  }

  @Post('sign-videos/:signVideoId/videos/reorder')
  @Roles(Role.ADMIN)
  async reorderVideos(
    @Param('signVideoId') signVideoId: string,
    @Body() data: { videoIds: string[] },
  ) {
    return this.glossDataService.reorderVideos(signVideoId, data.videoIds);
  }

  @Put(':id/compound')
  @Roles(Role.ADMIN)
  async updateCompound(
    @Param('id') id: string,
    @Body() data: UpdateCompoundDto,
  ) {
    return this.glossDataService.updateCompound(id, data);
  }
}
