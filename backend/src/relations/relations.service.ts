import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';

@Injectable()
export class RelationsService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService
  ) {}

  async deleteRelatedGloss(id: string) {
    const relation = await this.prisma.relatedGloss.findUnique({
      where: { id },
      include: { sourceGloss: true }
    });

    if (!relation) {
      throw new NotFoundException(`RelatedGloss with ID ${id} not found or could not be deleted`);
    }

    await this.prisma.relatedGloss.delete({
      where: { id },
    });

    return this.glossDataService.getGlossData(relation.sourceGlossId);
  }

  async createRelation(sourceGlossId: string, targetGlossId: string, relationType: string) {
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

    // Check if relation already exists
    const existingRelation = await this.prisma.relatedGloss.findFirst({
      where: {
        sourceGlossId,
        targetGlossId
      }
    });

    if (existingRelation) {
      throw new ConflictException('Relation already exists between these glosses');
    }

    await this.prisma.relatedGloss.create({
      data: {
        sourceGlossId,
        targetGlossId,
        relationType: relationType as any
      }
    });

    return this.glossDataService.getGlossData(sourceGlossId);
  }

  async updateRelation(relationId: string, relationType: string) {
    const relation = await this.prisma.relatedGloss.findUnique({
      where: { id: relationId }
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    await this.prisma.relatedGloss.update({
      where: { id: relationId },
      data: {
        relationType: relationType as any
      }
    });

    return this.glossDataService.getGlossData(relation.sourceGlossId);
  }
} 