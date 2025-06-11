import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';
import { CreateTranslationDto, UpdateTranslationDto } from './dto/translation.dto';

@Injectable()
export class TranslationsService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService
  ) {}

  async createSenseTranslation(senseId: string, data: CreateTranslationDto) {
    const sense = await this.prisma.sense.findUnique({
      where: { id: senseId }
    });

    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    await this.prisma.senseTranslation.create({
      data: {
        translation: data.translation,
        language: data.language,
        senseId: senseId
      }
    });

    return this.glossDataService.getGlossData(sense.glossDataId);
  }

  async updateSenseTranslation(id: string, data: UpdateTranslationDto) {
    const translation = await this.prisma.senseTranslation.findUnique({
      where: { id },
      include: { sense: true }
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.senseTranslation.update({
      where: { id },
      data: {
        translation: data.translation,
        language: data.language
      }
    });

    return this.glossDataService.getGlossData(translation.sense.glossDataId);
  }

  async deleteSenseTranslation(id: string) {
    const translation = await this.prisma.senseTranslation.findUnique({
      where: { id },
      include: { sense: true }
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.senseTranslation.delete({
      where: { id }
    });

    return this.glossDataService.getGlossData(translation.sense.glossDataId);
  }
} 