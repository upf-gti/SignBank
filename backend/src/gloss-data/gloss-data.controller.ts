import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { GlossDataService } from './gloss-data.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Controller('gloss-data')
@UseGuards(JwtGuard, RolesGuard)
export class GlossDataController {
  constructor(private readonly glossDataService: GlossDataService) {}

  @Get(':id')
  async getGlossDataById(@Param('id') id: string) {
    return this.glossDataService.getGlossDataById(id);
  }

  // Sense deletion
  @Delete('senses/:id')
  @Roles(Role.ADMIN)
  async deleteSense(@Param('id') id: string) {
    return this.glossDataService.deleteSense(id);
  }

  // Definition deletion
  @Delete('definitions/:id')
  @Roles(Role.ADMIN)
  async deleteDefinition(@Param('id') id: string) {
    return this.glossDataService.deleteDefinition(id);
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

  // Related Gloss deletion
  @Delete('related-glosses/:id')
  @Roles(Role.ADMIN)
  async deleteRelatedGloss(@Param('id') id: string) {
    return this.glossDataService.deleteRelatedGloss(id);
  }

  // Minimal Pair deletion
  @Delete('minimal-pairs/:id')
  @Roles(Role.ADMIN)
  async deleteMinimalPair(@Param('id') id: string) {
    return this.glossDataService.deleteMinimalPair(id);
  }
} 