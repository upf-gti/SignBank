import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSenseDto, ReorderSenseDto } from './dto/update-sense.dto';
import { GlossDataService } from '../gloss-data/gloss-data.service';

@Injectable()
export class SensesService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService
  ) {}

  async addSense(glossDataId: string, data: UpdateSenseDto) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { senses: true }
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const senseCount = await this.prisma.sense.count({
      where: { glossDataId }
    });

    await this.prisma.sense.create({
      data: {
        senseTitle: data.senseTitle,
        lexicalCategory: data.lexicalCategory,
        priority: senseCount,
        glossDataId
      }
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async updateSense(glossDataId: string, senseId: string, data: UpdateSenseDto) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { senses: true }
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const sense = glossData.senses.find(s => s.id === senseId);
    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    await this.prisma.sense.update({
      where: { id: senseId },
      data: {
        senseTitle: data.senseTitle,
        lexicalCategory: data.lexicalCategory,
        ...(data.priority !== undefined && { priority: data.priority })
      }
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async updateSensePriority(glossDataId: string, data: ReorderSenseDto) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { senses: true }
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const sense = glossData.senses.find(s => s.id === data.senseId);
    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    // Update priorities for all affected senses
    const senses = glossData.senses.sort((a, b) => a.priority - b.priority);
    const oldIndex = senses.findIndex(s => s.id === data.senseId);
    const newIndex = data.newPriority;

    if (oldIndex === newIndex) {
      return this.glossDataService.getGlossData(glossDataId);
    }

    const start = Math.min(oldIndex, newIndex);
    const end = Math.max(oldIndex, newIndex);
    const movingUp = oldIndex > newIndex;

    await this.prisma.$transaction(
      senses.slice(start, end + 1).map((sense, i) => {
        const actualIndex = start + i;
        let newPriority = actualIndex;

        if (movingUp && actualIndex === start) {
          newPriority = start; // The moved item
        } else if (movingUp) {
          newPriority = actualIndex + 1; // Shift others down
        } else if (!movingUp && actualIndex === end) {
          newPriority = end; // The moved item
        } else {
          newPriority = actualIndex - 1; // Shift others up
        }

        return this.prisma.sense.update({
          where: { id: sense.id },
          data: { priority: newPriority }
        });
      })
    );

    return this.glossDataService.getGlossData(glossDataId);
  }

  async deleteSense(glossDataId: string, senseId: string) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { senses: true }
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const sense = glossData.senses.find(s => s.id === senseId);
    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    // Don't allow deleting the last sense
    if (glossData.senses.length <= 1) {
      throw new BadRequestException('Cannot delete the last sense');
    }

    await this.prisma.sense.delete({
      where: { id: senseId }
    });

    // Update priorities for remaining senses
    const remainingSenses = glossData.senses
      .filter(s => s.id !== senseId)
      .sort((a, b) => a.priority - b.priority);

    await this.prisma.$transaction(
      remainingSenses.map((sense, index) =>
        this.prisma.sense.update({
          where: { id: sense.id },
          data: { priority: index }
        })
      )
    );

    return this.glossDataService.getGlossData(glossDataId);
  }
} 