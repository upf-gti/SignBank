import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MinimalPairsService } from './minimal-pairs.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Controller('minimal-pairs')
@UseGuards(JwtGuard, RolesGuard)
export class MinimalPairsController {
  constructor(private readonly minimalPairsService: MinimalPairsService) {}

  @Post('gloss/:id')
  @Roles(Role.ADMIN)
  async createMinimalPair(
    @Param('id') glossId: string,
    @Body() data: { targetGlossId: string, distinction: string }
  ) {
    return this.minimalPairsService.createMinimalPair(glossId, data.targetGlossId, data.distinction);
  }

  @Patch(':pairId')
  @Roles(Role.ADMIN)
  async updateMinimalPair(
    @Param('pairId') pairId: string,
    @Body() data: { distinction: string }
  ) {
    return this.minimalPairsService.updateMinimalPair(pairId, data.distinction);
  }

  @Delete(':pairId')
  @Roles(Role.ADMIN)
  async deleteMinimalPair(@Param('pairId') pairId: string) {
    return this.minimalPairsService.deleteMinimalPair(pairId);
  }
} 