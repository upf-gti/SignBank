import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';
import { CreateTranslationDto, UpdateTranslationDto } from './dto/translation.dto';

@Injectable()
export class TranslationsService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService,
  ) {}

  async createGlossTranslation(glossDataId: string, data: CreateTranslationDto) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    await this.prisma.glossTranslation.create({
      data: {
        translation: data.translation,
        language: data.language,
        glossDataId,
      },
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async updateGlossTranslation(id: string, data: UpdateTranslationDto) {
    const translation = await this.prisma.glossTranslation.findUnique({
      where: { id },
      include: { glossData: true },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.glossTranslation.update({
      where: { id },
      data: {
        translation: data.translation,
        language: data.language,
      },
    });

    return this.glossDataService.getGlossData(translation.glossDataId);
  }

  async deleteGlossTranslation(id: string) {
    const translation = await this.prisma.glossTranslation.findUnique({
      where: { id },
      include: { glossData: true },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.glossTranslation.delete({
      where: { id },
    });

    return this.glossDataService.getGlossData(translation.glossDataId);
  }
}
