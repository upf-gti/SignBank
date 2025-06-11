import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';

@Injectable()
export class MinimalPairsService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService
  ) {}

  async deleteMinimalPair(id: string) {
    const pair = await this.prisma.minimalPair.findUnique({
      where: { id },
      include: { sourceGloss: true }
    });

    if (!pair) {
      throw new NotFoundException(`MinimalPair with ID ${id} not found or could not be deleted`);
    }

    await this.prisma.minimalPair.delete({
      where: { id },
    });

    return this.glossDataService.getGlossData(pair.sourceGlossId);
  }

  async createMinimalPair(sourceGlossId: string, targetGlossId: string, distinction: string) {
    // Check if both glosses exist
    const sourceGloss = await this.prisma.glossData.findUnique({
      where: { id: sourceGlossId }
    });
    const targetGloss = await this.prisma.glossData.findUnique({
      where: { id: targetGlossId }
    });

    if (!sourceGloss) {
      throw new NotFoundException('Source gloss not found');
    }
    if (!targetGloss) {
      throw new NotFoundException('Target gloss not found');
    }

    // Check if minimal pair already exists
    const existingPair = await this.prisma.minimalPair.findFirst({
      where: {
        sourceGlossId,
        targetGlossId
      }
    });

    if (existingPair) {
      throw new ConflictException('Minimal pair already exists between these glosses');
    }

    await this.prisma.minimalPair.create({
      data: {
        sourceGlossId,
        targetGlossId,
        distinction
      }
    });

    return this.glossDataService.getGlossData(sourceGlossId);
  }

  async updateMinimalPair(pairId: string, distinction: string) {
    const pair = await this.prisma.minimalPair.findUnique({
      where: { id: pairId }
    });

    if (!pair) {
      throw new NotFoundException('Minimal pair not found');
    }

    await this.prisma.minimalPair.update({
      where: { id: pairId },
      data: {
        distinction
      }
    });

    return this.glossDataService.getGlossData(pair.sourceGlossId);
  }
} 