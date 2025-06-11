import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GlossDataService } from './gloss-data.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role, Language } from '@prisma/client';
import { UpdateSenseDto, ReorderSenseDto } from './dto/update-sense.dto';
import { UpdateDefinitionDto, UpdateDefinitionTranslationDto } from './dto/update-definition.dto';

@Controller('gloss-data')
@UseGuards(JwtGuard, RolesGuard)
export class GlossDataController {
  constructor(private readonly glossDataService: GlossDataService) {}

  @Get(':id')
  async getGlossData(@Param('id') id: string) {
    return this.glossDataService.getGlossData(id);
  }

  // Sense management
  @Post(':id/senses')
  async addSense(
    @Param('id') id: string,
    @Body() updateSenseDto: UpdateSenseDto,
  ) {
    return this.glossDataService.addSense(id, updateSenseDto);
  }

  @Patch(':id/senses/:senseId')
  async updateSense(
    @Param('id') id: string,
    @Param('senseId') senseId: string,
    @Body() updateSenseDto: UpdateSenseDto,
  ) {
    return this.glossDataService.updateSense(id, senseId, updateSenseDto);
  }

  @Patch(':id/senses/reorder')
  async updateSensePriority(
    @Param('id') id: string,
    @Body() reorderSenseDto: ReorderSenseDto,
  ) {
    return this.glossDataService.updateSensePriority(id, reorderSenseDto);
  }

  @Delete(':id/senses/:senseId')
  async deleteSense(
    @Param('id') id: string,
    @Param('senseId') senseId: string,
  ) {
    return this.glossDataService.deleteSense(id, senseId);
  }

  // Example deletion
  @Delete('examples/:id')
  @Roles(Role.ADMIN)
  async deleteExample(@Param('id') id: string) {
    return this.glossDataService.deleteExample(id);
  }

  // SignVideo deletion
  @Delete('sign-videos/:id')
  @Roles(Role.ADMIN)
  async deleteSignVideo(@Param('id') id: string) {
    return this.glossDataService.deleteSignVideo(id);
  }

  // Video deletion (individual video angles)
  @Delete('videos/:id')
  @Roles(Role.ADMIN)
  async deleteVideo(@Param('id') id: string) {
    return this.glossDataService.deleteVideo(id);
  }

  // VideoData deletion
  @Delete('video-data/:id')
  @Roles(Role.ADMIN)
  async deleteVideoData(@Param('id') id: string) {
    return this.glossDataService.deleteVideoData(id);
  }

  // SenseTranslation deletion
  @Delete('sense-translations/:id')
  @Roles(Role.ADMIN)
  async deleteSenseTranslation(@Param('id') id: string) {
    return this.glossDataService.deleteSenseTranslation(id);
  }

  // DefinitionTranslation deletion
  @Delete('definition-translations/:id')
  @Roles(Role.ADMIN)
  async deleteDefinitionTranslation(@Param('id') id: string) {
    return this.glossDataService.deleteDefinitionTranslation(id);
  }

  // ExampleTranslation deletion
  @Delete('example-translations/:id')
  @Roles(Role.ADMIN)
  async deleteExampleTranslation(@Param('id') id: string) {
    return this.glossDataService.deleteExampleTranslation(id);
  }





  @Post('senses/:senseId/definitions')
  @Roles(Role.ADMIN)
  async createDefinition(
    @Param('senseId') senseId: string,
    @Body() data: UpdateDefinitionDto
  ) {
    return this.glossDataService.createDefinition(senseId, data);
  }

  @Patch('senses/:senseId/definitions/:definitionId')
  @Roles(Role.ADMIN)
  async updateDefinition(
    @Param('senseId') senseId: string,
    @Param('definitionId') definitionId: string,
    @Body() data: UpdateDefinitionDto
  ) {
    return this.glossDataService.updateDefinition(senseId, definitionId, data);
  }

  @Delete('senses/:senseId/definitions/:definitionId')
  @Roles(Role.ADMIN)
  async deleteDefinition(
    @Param('senseId') senseId: string,
    @Param('definitionId') definitionId: string,
  ) {
    return this.glossDataService.deleteDefinition(senseId, definitionId);
  }

  @Patch('definitions/:definitionId/translations/:translationId')
  @Roles(Role.ADMIN)
  async updateDefinitionTranslation(
    @Param('definitionId') definitionId: string,
    @Param('translationId') translationId: string,
    @Body() data: UpdateDefinitionTranslationDto
  ) {
    return this.glossDataService.updateDefinitionTranslation(definitionId, translationId, data);
  }

  @Post('senses/:senseId/translations')
  @Roles(Role.ADMIN)
  async createSenseTranslation(
    @Param('senseId') senseId: string,
    @Body() data: { translation: string, language: Language }
  ) {
    return this.glossDataService.createSenseTranslation(senseId, data);
  }

  @Patch('sense-translations/:id')
  @Roles(Role.ADMIN)
  async updateSenseTranslation(
    @Param('id') id: string,
    @Body() data: { translation: string, language: Language }
  ) {
    return this.glossDataService.updateSenseTranslation(id, data);
  }

  @Post('senses/:senseId/examples')
  @Roles(Role.ADMIN)
  async createExample(
    @Param('senseId') senseId: string,
    @Body() data: { example: string, exampleVideoURL: string }
  ) {
    return this.glossDataService.createExample(senseId, data);
  }

  @Patch('examples/:id')
  @Roles(Role.ADMIN)
  async updateExample(
    @Param('id') id: string,
    @Body() data: { example: string, exampleVideoURL: string }
  ) {
    return this.glossDataService.updateExample(id, data);
  }

  @Post('examples/:exampleId/translations')
  @Roles(Role.ADMIN)
  async createExampleTranslation(
    @Param('exampleId') exampleId: string,
    @Body() data: { translation: string, language: Language }
  ) {
    return this.glossDataService.createExampleTranslation(exampleId, data);
  }

  @Patch('example-translations/:id')
  @Roles(Role.ADMIN)
  async updateExampleTranslation(
    @Param('id') id: string,
    @Body() data: { translation: string, language: Language }
  ) {
    return this.glossDataService.updateExampleTranslation(id, data);
  }

  // SignVideo priority management
  @Patch('sign-videos/:signVideoId/priority')
  @Roles(Role.ADMIN)
  async updateSignVideoPriority(
    @Param('signVideoId') signVideoId: string,
    @Body() data: { priority: number }
  ) {
    return this.glossDataService.updateSignVideoPriority(signVideoId, data.priority);
  }

  @Post('senses/:senseId/sign-videos/reorder')
  @Roles(Role.ADMIN)
  async reorderSignVideos(
    @Param('senseId') senseId: string,
    @Body() data: { signVideoIds: string[] }
  ) {
    return this.glossDataService.reorderSignVideos(senseId, data.signVideoIds);
  }

  // Video priority management
  @Patch('videos/:videoId/priority')
  @Roles(Role.ADMIN)
  async updateVideoPriority(
    @Param('videoId') videoId: string,
    @Body() data: { priority: number }
  ) {
    return this.glossDataService.updateVideoPriority(videoId, data.priority);
  }

  @Post('sign-videos/:signVideoId/videos/reorder')
  @Roles(Role.ADMIN)
  async reorderVideos(
    @Param('signVideoId') signVideoId: string,
    @Body() data: { videoIds: string[] }
  ) {
    return this.glossDataService.reorderVideos(signVideoId, data.videoIds);
  }

} 