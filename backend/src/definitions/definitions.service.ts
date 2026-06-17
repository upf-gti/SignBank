import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';
import { CreateDefinitionDto, UpdateDefinitionDto, UpdateDefinitionTranslationDto, CreateDefinitionTranslationDto } from './dto/definition.dto';
import { LexicalCategory } from '@prisma/client';

@Injectable()
export class DefinitionsService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService,
  ) {}

  async createDefinition(glossDataId: string, data: CreateDefinitionDto) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const definitionCount = await this.prisma.definition.count({
      where: { glossDataId },
    });

    await this.prisma.definition.create({
      data: {
        title: data.title || '',
        definition: data.definition,
        videoDefinitionUrl: data.videoDefinitionUrl,
        lexicalCategory: data.lexicalCategory ?? LexicalCategory.NOUN,
        priority: data.priority ?? definitionCount,
        glossDataId,
      },
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async updateDefinition(glossDataId: string, definitionId: string, data: UpdateDefinitionDto) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { definitions: true },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const definition = glossData.definitions.find((d) => d.id === definitionId);
    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.prisma.definition.update({
      where: { id: definitionId },
      data: {
        title: data.title,
        definition: data.definition,
        videoDefinitionUrl: data.videoDefinitionUrl,
        ...(data.lexicalCategory !== undefined && { lexicalCategory: data.lexicalCategory }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async deleteDefinition(glossDataId: string, definitionId: string) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { definitions: true },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const definition = glossData.definitions.find((d) => d.id === definitionId);
    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.prisma.definition.delete({
      where: { id: definitionId },
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async deleteDefinitionVideo(glossDataId: string, definitionId: string) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { definitions: true },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const definition = glossData.definitions.find((d) => d.id === definitionId);
    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.prisma.definition.update({
      where: { id: definitionId },
      data: { videoDefinitionUrl: null },
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async createDefinitionTranslation(definitionId: string, data: CreateDefinitionTranslationDto) {
    const definition = await this.prisma.definition.findUnique({
      where: { id: definitionId },
    });

    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.prisma.definitionTranslation.create({
      data: {
        translation: data.translation,
        language: data.language,
        definitionId,
      },
    });

    return this.glossDataService.getGlossData(definition.glossDataId);
  }

  async updateDefinitionTranslation(
    definitionId: string,
    translationId: string,
    data: UpdateDefinitionTranslationDto,
  ) {
    const definition = await this.prisma.definition.findUnique({
      where: { id: definitionId },
      include: { definitionTranslations: true },
    });

    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    const translation = definition.definitionTranslations.find((t) => t.id === translationId);
    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.definitionTranslation.update({
      where: { id: translationId },
      data: {
        translation: data.translation,
        language: data.language,
      },
    });

    return this.glossDataService.getGlossData(definition.glossDataId);
  }

  async deleteDefinitionTranslation(definitionId: string, translationId: string) {
    const definition = await this.prisma.definition.findUnique({
      where: { id: definitionId },
    });

    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.prisma.definitionTranslation.delete({
      where: { id: translationId },
    });

    return this.glossDataService.getGlossData(definition.glossDataId);
  }
}
