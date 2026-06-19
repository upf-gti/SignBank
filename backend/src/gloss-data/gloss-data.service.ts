import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDefinitionDto, UpdateDefinitionTranslationDto } from './dto/update-definition.dto';
import { GlossStatus, Handedness, Language, LexicalCategory, Prisma } from '@prisma/client';
import { GLOSS_SEARCH_SYNC_EVENT } from '../typesense/types/gloss-index.type';
import { compoundPartsInclude } from '../glosses/compound-include';
import { CompoundPartInputDto, UpdateCompoundDto } from './dto/update-compound.dto';
import { VideoDataDto } from '../sign-videos/dto/video-data.dto';

const glossDataInclude = {
  dictionaryEntry: true,
  compoundParts: compoundPartsInclude,
  glossVideos: {
    include: {
      videos: true,
      videoData: true,
    },
  },
  definitions: {
    orderBy: { priority: 'asc' as const },
    include: {
      definitionTranslations: true,
    },
  },
  examples: {
    include: {
      exampleTranslations: true,
    },
  },
  glossTranslations: true,
  minimalPairsAsSource: {
    include: {
      sourceGloss: {
        include: {
          glossVideos: true,
          dictionaryEntry: true,
        },
      },
      targetGloss: {
        include: {
          glossVideos: true,
          dictionaryEntry: true,
        },
      },
    },
    where: {
      targetGloss: {
        dictionaryEntry: {
          status: GlossStatus.PUBLISHED,
        },
      },
    },
  },
  relationsAsSource: {
    include: {
      targetGloss: {
        include: {
          glossVideos: true,
          dictionaryEntry: true,
        },
      },
    },
    where: {
      targetGloss: {
        dictionaryEntry: {
          status: GlossStatus.PUBLISHED,
        },
      },
    },
  },
  relationsAsTarget: {
    include: {
      sourceGloss: {
        include: {
          glossVideos: true,
        },
      },
    },
  },
};

@Injectable()
export class GlossDataService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getGlossData(id: string) {
    return this.prisma.glossData.findUnique({
      where: { id },
      include: glossDataInclude,
    });
  }

  async updateGloss(id: string, gloss: string) {
    await this.prisma.glossData.update({
      where: { id },
      data: {
        gloss: gloss.trim(),
        currentVersion: {
          increment: 1,
        },
      },
    });
    this.notifySearchIndex(id);
    return this.getGlossData(id);
  }

  private notifySearchIndex(glossDataId: string) {
    this.eventEmitter.emit(GLOSS_SEARCH_SYNC_EVENT, { glossDataId });
  }

  async archiveGloss(id: string) {
    const dictionaryEntry = await this.prisma.dictionaryEntry.findUnique({
      where: { glossDataId: id },
    });

    if (!dictionaryEntry) {
      throw new NotFoundException('Dictionary entry not found for this gloss');
    }

    await this.prisma.dictionaryEntry.update({
      where: { id: dictionaryEntry.id },
      data: { status: 'ARCHIVED' },
    });

    this.notifySearchIndex(id);
    return this.getGlossData(id);
  }

  async unarchiveGloss(id: string) {
    const dictionaryEntry = await this.prisma.dictionaryEntry.findUnique({
      where: { glossDataId: id },
    });

    if (!dictionaryEntry) {
      throw new NotFoundException('Dictionary entry not found for this gloss');
    }

    await this.prisma.dictionaryEntry.update({
      where: { id: dictionaryEntry.id },
      data: { status: 'PUBLISHED' },
    });

    this.notifySearchIndex(id);
    return this.getGlossData(id);
  }

  async createDefinition(
    glossDataId: string,
    data: UpdateDefinitionDto & { lexicalCategory?: LexicalCategory; priority?: number },
  ) {
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
        lexicalCategory: data.lexicalCategory ?? LexicalCategory.NOUN,
        priority: data.priority ?? definitionCount,
        glossDataId,
      },
      include: {
        definitionTranslations: true,
      },
    });

    this.notifySearchIndex(glossDataId);
    return this.getGlossData(glossDataId);
  }

  async updateDefinition(
    glossDataId: string,
    definitionId: string,
    data: UpdateDefinitionDto & { lexicalCategory?: LexicalCategory; priority?: number },
  ) {
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
        ...(data.lexicalCategory !== undefined && { lexicalCategory: data.lexicalCategory }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
      include: {
        definitionTranslations: true,
      },
    });

    this.notifySearchIndex(glossDataId);
    return this.getGlossData(glossDataId);
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

    if (glossData.definitions.length <= 1) {
      throw new BadRequestException('Cannot delete the last definition');
    }

    await this.prisma.definition.delete({
      where: { id: definitionId },
    });

    this.notifySearchIndex(glossDataId);
    return this.getGlossData(glossDataId);
  }

  async createExample(glossDataId: string, data: { example: string; exampleVideoURL: string }) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    await this.prisma.example.create({
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL,
        glossDataId,
      },
    });

    return this.getGlossData(glossDataId);
  }

  async updateExample(id: string, data: { example: string; exampleVideoURL: string }) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { glossData: true },
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.example.update({
      where: { id },
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL,
      },
    });

    return this.getGlossData(example.glossDataId);
  }

  async deleteExample(id: string) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { glossData: true },
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.example.delete({
      where: { id },
    });

    return this.getGlossData(example.glossDataId);
  }

  async createExampleTranslation(exampleId: string, data: { translation: string; language: Language }) {
    const example = await this.prisma.example.findUnique({
      where: { id: exampleId },
      include: { glossData: true },
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.exampleTranslation.create({
      data: {
        translation: data.translation,
        language: data.language,
        exampleId,
      },
    });

    return this.getGlossData(example.glossDataId);
  }

  async updateExampleTranslation(id: string, data: { translation: string; language: Language }) {
    const translation = await this.prisma.exampleTranslation.findUnique({
      where: { id },
      include: { Example: { include: { glossData: true } } },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.exampleTranslation.update({
      where: { id },
      data: {
        translation: data.translation,
        language: data.language,
      },
    });

    return this.getGlossData(translation.Example!.glossDataId);
  }

  async deleteExampleTranslation(id: string) {
    const translation = await this.prisma.exampleTranslation.findUnique({
      where: { id },
      include: { Example: { include: { glossData: true } } },
    });

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    await this.prisma.exampleTranslation.delete({
      where: { id },
    });

    return this.getGlossData(translation.Example!.glossDataId);
  }

  async deleteSignVideo(id: string) {
    try {
      await this.prisma.video.deleteMany({
        where: { signVideoId: id },
      });

      return await this.prisma.signVideo.delete({
        where: { id },
        include: {
          videoData: true,
        },
      });
    } catch {
      throw new NotFoundException(`SignVideo with ID ${id} not found or could not be deleted`);
    }
  }

  async deleteVideo(id: string) {
    try {
      return await this.prisma.video.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Video with ID ${id} not found or could not be deleted`);
    }
  }

  async deleteVideoData(id: string) {
    try {
      return await this.prisma.videoData.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`VideoData with ID ${id} not found or could not be deleted`);
    }
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

    return this.getGlossData(translation.glossDataId);
  }

  async deleteDefinitionTranslation(id: string) {
    try {
      return await this.prisma.definitionTranslation.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`DefinitionTranslation with ID ${id} not found or could not be deleted`);
    }
  }

  async deleteRelatedGloss(id: string) {
    const relation = await this.prisma.relatedGloss.findUnique({
      where: { id },
      include: { sourceGloss: true },
    });

    if (!relation) {
      throw new NotFoundException(`RelatedGloss with ID ${id} not found or could not be deleted`);
    }

    await this.prisma.relatedGloss.delete({
      where: { id },
    });

    return this.getGlossData(relation.sourceGlossId);
  }

  async createRelation(sourceGlossId: string, targetGlossId: string, relationType: string) {
    const sourceGloss = await this.prisma.glossData.findUnique({
      where: { id: sourceGlossId },
    });
    const targetGloss = await this.prisma.glossData.findUnique({
      where: { id: targetGlossId },
    });

    if (!sourceGloss) {
      throw new NotFoundException('Source gloss not found');
    }
    if (!targetGloss) {
      throw new NotFoundException('Target gloss not found');
    }

    const existingRelation = await this.prisma.relatedGloss.findFirst({
      where: { sourceGlossId, targetGlossId },
    });

    if (existingRelation) {
      throw new ConflictException('Relation already exists between these glosses');
    }

    await this.prisma.relatedGloss.create({
      data: {
        sourceGlossId,
        targetGlossId,
        relationType: relationType as any,
      },
    });

    return this.getGlossData(sourceGlossId);
  }

  async updateRelation(relationId: string, relationType: string) {
    const relation = await this.prisma.relatedGloss.findUnique({
      where: { id: relationId },
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    await this.prisma.relatedGloss.update({
      where: { id: relationId },
      data: { relationType: relationType as any },
    });

    return this.getGlossData(relation.sourceGlossId);
  }

  async deleteMinimalPair(id: string) {
    const pair = await this.prisma.minimalPair.findUnique({
      where: { id },
      include: { sourceGloss: true },
    });

    if (!pair) {
      throw new NotFoundException(`MinimalPair with ID ${id} not found or could not be deleted`);
    }

    await this.prisma.minimalPair.delete({
      where: { id },
    });

    return this.getGlossData(pair.sourceGlossId);
  }

  async createMinimalPair(sourceGlossId: string, targetGlossId: string, distinction: string) {
    const sourceGloss = await this.prisma.glossData.findUnique({
      where: { id: sourceGlossId },
    });
    const targetGloss = await this.prisma.glossData.findUnique({
      where: { id: targetGlossId },
    });

    if (!sourceGloss) {
      throw new NotFoundException('Source gloss not found');
    }
    if (!targetGloss) {
      throw new NotFoundException('Target gloss not found');
    }

    const existingPair = await this.prisma.minimalPair.findFirst({
      where: { sourceGlossId, targetGlossId },
    });

    if (existingPair) {
      throw new ConflictException('Minimal pair already exists between these glosses');
    }

    await this.prisma.minimalPair.create({
      data: { sourceGlossId, targetGlossId, distinction },
    });

    return this.getGlossData(sourceGlossId);
  }

  async updateMinimalPair(pairId: string, distinction: string) {
    const pair = await this.prisma.minimalPair.findUnique({
      where: { id: pairId },
    });

    if (!pair) {
      throw new NotFoundException('Minimal pair not found');
    }

    await this.prisma.minimalPair.update({
      where: { id: pairId },
      data: { distinction },
    });

    return this.getGlossData(pair.sourceGlossId);
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

    const updatedTranslation = await this.prisma.definitionTranslation.update({
      where: { id: translationId },
      data: {
        translation: data.translation,
        language: data.language,
      },
      include: {
        definition: true,
      },
    });

    this.notifySearchIndex(updatedTranslation.definition.glossDataId);
    return this.getGlossData(updatedTranslation.definition.glossDataId);
  }

  async createGlossTranslation(glossDataId: string, data: { translation: string; language: Language }) {
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

    return this.getGlossData(glossDataId);
  }

  async updateGlossTranslation(id: string, data: { translation: string; language: Language }) {
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

    return this.getGlossData(translation.glossDataId);
  }

  async updateSignVideoPriority(signVideoId: string, priority: number) {
    const signVideo = await this.prisma.signVideo.findUnique({
      where: { id: signVideoId },
      include: { glossData: true },
    });

    if (!signVideo) {
      throw new NotFoundException('SignVideo not found');
    }

    await this.prisma.signVideo.update({
      where: { id: signVideoId },
      data: { priority },
    });

    this.notifySearchIndex(signVideo.glossDataId);
    return this.getGlossData(signVideo.glossDataId);
  }

  async reorderSignVideos(glossDataId: string, signVideoIds: string[]) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
      include: { glossVideos: true },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    const updatePromises = signVideoIds.map((signVideoId, index) =>
      this.prisma.signVideo.update({
        where: { id: signVideoId },
        data: { priority: index + 1 },
      }),
    );

    await Promise.all(updatePromises);

    this.notifySearchIndex(glossDataId);
    return this.getGlossData(glossDataId);
  }

  async updateVideoPriority(videoId: string, priority: number) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        signVideo: {
          include: { glossData: true },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    await this.prisma.video.update({
      where: { id: videoId },
      data: { priority },
    });

    this.notifySearchIndex(video.signVideo.glossDataId);
    return this.getGlossData(video.signVideo.glossDataId);
  }

  async reorderVideos(signVideoId: string, videoIds: string[]) {
    const signVideo = await this.prisma.signVideo.findUnique({
      where: { id: signVideoId },
      include: {
        videos: true,
        glossData: true,
      },
    });

    if (!signVideo) {
      throw new NotFoundException('SignVideo not found');
    }

    const updatePromises = videoIds.map((videoId, index) =>
      this.prisma.video.update({
        where: { id: videoId },
        data: { priority: index + 1 },
      }),
    );

    await Promise.all(updatePromises);

    this.notifySearchIndex(signVideo.glossDataId);
    return this.getGlossData(signVideo.glossDataId);
  }

  private buildVideoDataCreateInput(videoData: VideoDataDto): Prisma.VideoDataCreateInput {
    return {
      handedness: videoData.handedness || Handedness.ONE,
      dominantConfiguration: videoData.dominantConfiguration ?? null,
      nonDominantConfiguration: videoData.nonDominantConfiguration ?? null,
      dominantRelationBetweenArticulators: videoData.dominantRelationBetweenArticulators ?? null,
      nonDominantRelationBetweenArticulators: videoData.nonDominantRelationBetweenArticulators ?? null,
      configurationChanges: videoData.configurationChanges || 'EMPTY',
      location: videoData.location || 'EMPTY',
      movementRelatedOrientation: videoData.movementRelatedOrientation || 'EMPTY',
      orientationRelatedToLocation: videoData.orientationRelatedToLocation || 'EMPTY',
      orientationChange: videoData.orientationChange || 'EMPTY',
      contactType: videoData.contactType || 'EMPTY',
      movementType: videoData.movementType || 'EMPTY',
      movementDirection: videoData.movementDirection || 'EMPTY',
      vocalization: videoData.vocalization || 'none',
      nonManualComponent: videoData.nonManualComponent || 'none',
      inicialization: videoData.inicialization || 'none',
      repeatedMovement: videoData.repeatedMovement ?? false,
    };
  }

  private async deleteCompoundPartById(partId: string) {
    const part = await this.prisma.compoundPart.findUnique({
      where: { id: partId },
      include: { inlineSignVideo: true },
    });
    if (!part) return;

    if (part.inlineSignVideoId) {
      await this.prisma.video.deleteMany({ where: { signVideoId: part.inlineSignVideoId } });
      await this.prisma.signVideo.delete({ where: { id: part.inlineSignVideoId } });
    }

    const phonologyId = part.inlinePhonologyId;
    await this.prisma.compoundPart.delete({ where: { id: partId } });

    if (phonologyId) {
      await this.prisma.videoData.delete({ where: { id: phonologyId } }).catch(() => undefined);
    }
  }

  private async upsertInlineSignVideo(
    partId: string,
    videoDataId: string,
    gloss: string,
    inlineSignVideo: CompoundPartInputDto['inlineSignVideo'],
    existingSignVideoId?: string | null,
  ) {
    const videos = (inlineSignVideo?.videos ?? []).filter((video) => video.url?.trim());
    if (!videos.length) {
      if (existingSignVideoId) {
        await this.prisma.video.deleteMany({ where: { signVideoId: existingSignVideoId } });
        await this.prisma.signVideo.delete({ where: { id: existingSignVideoId } });
        await this.prisma.compoundPart.update({
          where: { id: partId },
          data: { inlineSignVideoId: null },
        });
      }
      return;
    }

    if (existingSignVideoId) {
      await this.prisma.video.deleteMany({ where: { signVideoId: existingSignVideoId } });
      await this.prisma.signVideo.update({
        where: { id: existingSignVideoId },
        data: {
          title: gloss,
          videoDataId,
          videos: {
            create: videos.map((video, index) => ({
              angle: video.angle || 'front',
              url: video.url!,
              priority: video.priority ?? index + 1,
            })),
          },
        },
      });
      return;
    }

    const signVideo = await this.prisma.signVideo.create({
      data: {
        title: gloss,
        priority: 1,
        videoDataId,
        videos: {
          create: videos.map((video, index) => ({
            angle: video.angle || 'front',
            url: video.url!,
            priority: video.priority ?? index + 1,
          })),
        },
      },
    });

    await this.prisma.compoundPart.update({
      where: { id: partId },
      data: { inlineSignVideoId: signVideo.id },
    });
  }

  private async upsertCompoundPart(glossDataId: string, partDto: CompoundPartInputDto) {
    const isLinked = Boolean(partDto.linkedGlossId);

    if (isLinked) {
      if (partDto.id) {
        const existing = await this.prisma.compoundPart.findUnique({
          where: { id: partDto.id },
          include: { inlineSignVideo: true },
        });
        if (existing?.inlineSignVideoId || existing?.inlinePhonologyId) {
          await this.deleteCompoundPartById(partDto.id);
          return this.prisma.compoundPart.create({
            data: {
              glossDataId,
              position: partDto.position,
              gloss: partDto.gloss,
              compExternalId: partDto.compExternalId ?? null,
              redundant: partDto.redundant ?? false,
              linkedGlossId: partDto.linkedGlossId,
            },
          });
        }
        return this.prisma.compoundPart.update({
          where: { id: partDto.id },
          data: {
            position: partDto.position,
            gloss: partDto.gloss,
            compExternalId: partDto.compExternalId ?? null,
            redundant: partDto.redundant ?? false,
            linkedGlossId: partDto.linkedGlossId,
            inlinePhonologyId: null,
            inlineSignVideoId: null,
          },
        });
      }

      return this.prisma.compoundPart.create({
        data: {
          glossDataId,
          position: partDto.position,
          gloss: partDto.gloss,
          compExternalId: partDto.compExternalId ?? null,
          redundant: partDto.redundant ?? false,
          linkedGlossId: partDto.linkedGlossId,
        },
      });
    }

    if (!partDto.inlinePhonology) {
      throw new BadRequestException(`Inline compound part "${partDto.gloss}" requires phonology`);
    }

    let partId = partDto.id;
    let phonologyId: string | undefined;
    let existingSignVideoId: string | null | undefined;

    if (partId) {
      const existing = await this.prisma.compoundPart.findUnique({
        where: { id: partId },
      });
      phonologyId = existing?.inlinePhonologyId ?? undefined;
      existingSignVideoId = existing?.inlineSignVideoId;
    }

    if (phonologyId) {
      await this.prisma.videoData.update({
        where: { id: phonologyId },
        data: this.buildVideoDataCreateInput(partDto.inlinePhonology),
      });
    } else {
      const created = await this.prisma.videoData.create({
        data: this.buildVideoDataCreateInput(partDto.inlinePhonology),
      });
      phonologyId = created.id;
    }

    if (partId) {
      await this.prisma.compoundPart.update({
        where: { id: partId },
        data: {
          position: partDto.position,
          gloss: partDto.gloss,
          compExternalId: partDto.compExternalId ?? null,
          redundant: partDto.redundant ?? false,
          linkedGlossId: null,
          inlinePhonologyId: phonologyId,
        },
      });
    } else {
      const createdPart = await this.prisma.compoundPart.create({
        data: {
          glossDataId,
          position: partDto.position,
          gloss: partDto.gloss,
          compExternalId: partDto.compExternalId ?? null,
          redundant: partDto.redundant ?? false,
          inlinePhonologyId: phonologyId,
        },
      });
      partId = createdPart.id;
      existingSignVideoId = null;
    }

    await this.upsertInlineSignVideo(
      partId,
      phonologyId,
      partDto.gloss,
      partDto.inlineSignVideo,
      existingSignVideoId,
    );
  }

  async updateCompound(glossDataId: string, dto: UpdateCompoundDto) {
    const gloss = await this.prisma.glossData.findUnique({ where: { id: glossDataId } });
    if (!gloss) {
      throw new NotFoundException(`GlossData with ID ${glossDataId} not found`);
    }

    await this.prisma.glossData.update({
      where: { id: glossDataId },
      data: {
        isCompound: dto.isCompound,
        iconicity: dto.iconicity ?? null,
      },
    });

    const existingParts = await this.prisma.compoundPart.findMany({ where: { glossDataId } });
    const incomingIds = new Set(dto.parts.map((part) => part.id).filter(Boolean));

    if (!dto.isCompound) {
      for (const part of existingParts) {
        await this.deleteCompoundPartById(part.id);
      }
      this.notifySearchIndex(glossDataId);
      return this.getGlossData(glossDataId);
    }

    for (const part of existingParts) {
      if (!incomingIds.has(part.id)) {
        await this.deleteCompoundPartById(part.id);
      }
    }

    const sortedParts = [...dto.parts].sort((a, b) => a.position - b.position);
    for (const partDto of sortedParts) {
      await this.upsertCompoundPart(glossDataId, partDto);
    }

    this.notifySearchIndex(glossDataId);
    return this.getGlossData(glossDataId);
  }
}
