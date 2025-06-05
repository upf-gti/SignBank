import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';
import { CreateExampleTranslationDto, UpdateExampleTranslationDto } from './dto/example-translation.dto';

@Injectable()
export class ExampleTranslationsService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService
  ) {}

  async createExampleTranslation(exampleId: string, data: CreateExampleTranslationDto) {
    const example = await this.prisma.example.findUnique({
      where: { id: exampleId },
      include: { sense: true }
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.exampleTranslation.create({
      data: {
        translation: data.translation,
        language: data.language,
        exampleId: exampleId
      }
    });

    return this.glossDataService.getGlossData(example.sense.glossDataId);
  }

  async updateExampleTranslation(id: string, data: UpdateExampleTranslationDto) {
    const translation = await this.prisma.exampleTranslation.findUnique({
      where: { id },
      include: { Example: { include: { sense: true } } }
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.exampleTranslation.update({
      where: { id },
      data: {
        translation: data.translation,
        language: data.language
      }
    });

    return this.glossDataService.getGlossData(translation.Example.sense.glossDataId);
  }

  async deleteExampleTranslation(id: string) {
    const translation = await this.prisma.exampleTranslation.findUnique({
      where: { id },
      include: { Example: { include: { sense: true } } }
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.exampleTranslation.delete({
      where: { id }
    });

    return this.glossDataService.getGlossData(translation.Example.sense.glossDataId);
  }
} 