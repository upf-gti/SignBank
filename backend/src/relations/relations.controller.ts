import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RelationsService } from './relations.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Controller('relations')
@UseGuards(JwtGuard, RolesGuard)
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Post('gloss/:id')
  @Roles(Role.ADMIN)
  async createRelation(
    @Param('id') glossId: string,
    @Body() data: { targetGlossId: string, relationType: string }
  ) {
    return this.relationsService.createRelation(glossId, data.targetGlossId, data.relationType);
  }

  @Patch(':relationId')
  @Roles(Role.ADMIN)
  async updateRelation(
    @Param('relationId') relationId: string,
    @Body() data: { relationType: string }
  ) {
    return this.relationsService.updateRelation(relationId, data.relationType);
  }

  @Delete(':relationId')
  @Roles(Role.ADMIN)
  async deleteRelatedGloss(@Param('relationId') relationId: string) {
    return this.relationsService.deleteRelatedGloss(relationId);
  }
} 