import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';
import { CreateDefinitionDto, UpdateDefinitionDto, UpdateDefinitionTranslationDto } from './dto/definition.dto';

@Injectable()
export class DefinitionsService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService
  ) {}

  async createDefinition(senseId: string, data: CreateDefinitionDto) {
    const sense = await this.prisma.sense.findUnique({
      where: { id: senseId }
    });

    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    await this.prisma.definition.create({
      data: {
        title: data.title || '',
        definition: data.definition,
        senseId: senseId
      },
      include: {
        definitionTranslations: true,
      }
    });

    return this.glossDataService.getGlossData(sense.glossDataId);
  }

  async updateDefinition(senseId: string, definitionId: string, data: UpdateDefinitionDto) {
    const sense = await this.prisma.sense.findUnique({
      where: { id: senseId },
      include: { definitions: true }
    });

    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    const definition = sense.definitions.find(d => d.id === definitionId);
    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.prisma.definition.update({
      where: { id: definitionId },
      data: {
        title: data.title,
        definition: data.definition,
      },
      include: {
        definitionTranslations: true,
      }
    });

    return this.glossDataService.getGlossData(sense.glossDataId);
  }

  async deleteDefinition(senseId: string, definitionId: string) {
    const sense = await this.prisma.sense.findUnique({
      where: { id: senseId },
      include: { definitions: true }
    });

    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    const definition = sense.definitions.find(d => d.id === definitionId);
    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.prisma.definition.delete({
      where: { id: definitionId }
    });

    return this.glossDataService.getGlossData(sense.glossDataId);
  }

  async updateDefinitionTranslation(definitionId: string, translationId: string, data: UpdateDefinitionTranslationDto) {
    const definition = await this.prisma.definition.findUnique({
      where: { id: definitionId },
      include: { definitionTranslations: true }
    });

    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    const translation = definition.definitionTranslations.find(t => t.id === translationId);
    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    const updatedTranslation = await this.prisma.definitionTranslation.update({
      where: { id: translationId },
      data: {
        translation: data.translation,
        language: data.language
      },
      include: {
        definition: {
          include: {
            sense: true
          }
        }
      }
    });

    return this.glossDataService.getGlossData(updatedTranslation.definition.sense.glossDataId);
  }
} 