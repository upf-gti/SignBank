import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSenseDto, ReorderSenseDto } from './dto/update-sense.dto';
import { UpdateDefinitionDto, UpdateDefinitionTranslationDto } from './dto/update-definition.dto';
import { Language } from '@prisma/client';

@Injectable()
export class GlossDataService {
  constructor(private prisma: PrismaService) {}

  async getGlossData(id: string) {
    return this.prisma.glossData.findUnique({
      where: { id },
      include: {
        senses: {
          orderBy: {
            priority: 'asc',
          },
          include: {
            definitions: {
              include: {
                definitionTranslations: true,
              },
            },
            signVideos: {
              include: {
                videos: true,
                videoData: true,
              },
            },
            examples: {
              include: {
                exampleTranslations: true,
              },
            },
            senseTranslations: true,
          },          
        },
        minimalPairsAsSource: {
          include: {
            sourceGloss: {
              include: {
                senses: {
                  include: {
                    signVideos: true,
                  },
                },
              },
            },
            targetGloss: {
              include: {
                senses: {
                  include: {
                    signVideos: true,
                  },
                },
              },
            },
          },
        },
        relationsAsSource: {
          include: {
            targetGloss: {
              include: {
                senses: {
                  include: {
                    signVideos: true,
                  },
                },
              },
            },
          },
        },
        relationsAsTarget: {
          include: {
            sourceGloss: {
              include: {
                senses: {
                  include: {
                    signVideos: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

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

    return this.getGlossData(glossDataId);
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

    return this.getGlossData(glossDataId);
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
      return this.getGlossData(glossDataId);
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

    return this.getGlossData(glossDataId);
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

    return this.getGlossData(glossDataId);
  }

  async createDefinition(senseId: string, data: UpdateDefinitionDto) {
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

    return this.getGlossData(sense.glossDataId);
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

    return this.getGlossData(sense.glossDataId);
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

    return this.getGlossData(sense.glossDataId);
  }

  async createExample(senseId: string, data: { example: string, exampleVideoURL: string }) {
    const sense = await this.prisma.sense.findUnique({
      where: { id: senseId }
    });

    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    await this.prisma.example.create({
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL,
        senseId: senseId
      }
    });

    return this.getGlossData(sense.glossDataId);
  }

  async updateExample(id: string, data: { example: string, exampleVideoURL: string }) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { sense: true }
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.example.update({
      where: { id },
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL
      }
    });

    return this.getGlossData(example.sense.glossDataId);
  }

  async deleteExample(id: string) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { sense: true }
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.example.delete({
      where: { id }
    });

    return this.getGlossData(example.sense.glossDataId);
  }

  async createExampleTranslation(exampleId: string, data: { translation: string, language: Language }) {
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

    return this.getGlossData(example.sense.glossDataId);
  }

  async updateExampleTranslation(id: string, data: { translation: string, language: Language }) {
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

    return this.getGlossData(translation.Example.sense.glossDataId);
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

    return this.getGlossData(translation.Example.sense.glossDataId);
  }

  // SignVideo deletion - will cascade delete videos and videoData
  async deleteSignVideo(id: string) {
    try {
      // First delete all related videos
      await this.prisma.video.deleteMany({
        where: { signVideoId: id },
      });

      // Then delete the sign video and its video data
      return await this.prisma.signVideo.delete({
        where: { id },
        include: {
          videoData: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`SignVideo with ID ${id} not found or could not be deleted`);
    }
  }

  // Individual video deletion
  async deleteVideo(id: string) {
    try {
      return await this.prisma.video.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Video with ID ${id} not found or could not be deleted`);
    }
  }

  // VideoData deletion
  async deleteVideoData(id: string) {
    try {
      return await this.prisma.videoData.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`VideoData with ID ${id} not found or could not be deleted`);
    }
  }

  // SenseTranslation deletion
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

    return this.getGlossData(translation.sense.glossDataId);
  }

  // DefinitionTranslation deletion
  async deleteDefinitionTranslation(id: string) {
    try {
      return await this.prisma.definitionTranslation.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`DefinitionTranslation with ID ${id} not found or could not be deleted`);
    }
  }

  // Related Gloss deletion
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

    return this.getGlossData(relation.sourceGlossId);
  }

  // Related Gloss creation
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

    return this.getGlossData(sourceGlossId);
  }

  // Related Gloss update
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

    return this.getGlossData(relation.sourceGlossId);
  }

  // Minimal Pair deletion
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

    return this.getGlossData(pair.sourceGlossId);
  }

  // Minimal Pair creation
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

    return this.getGlossData(sourceGlossId);
  }

  // Minimal Pair update
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

    return this.getGlossData(pair.sourceGlossId);
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

    return this.getGlossData(updatedTranslation.definition.sense.glossDataId);
  }

  async createSenseTranslation(senseId: string, data: { translation: string, language: Language }) {
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

    return this.getGlossData(sense.glossDataId);
  }

  async updateSenseTranslation(id: string, data: { translation: string, language: Language }) {
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

    return this.getGlossData(translation.sense.glossDataId);
  }

  // SignVideo priority management
  async updateSignVideoPriority(signVideoId: string, priority: number) {
    const signVideo = await this.prisma.signVideo.findUnique({
      where: { id: signVideoId },
      include: { sense: true }
    });

    if (!signVideo) {
      throw new NotFoundException('SignVideo not found');
    }

    await this.prisma.signVideo.update({
      where: { id: signVideoId },
      data: { priority }
    });

    return this.getGlossData(signVideo.sense.glossDataId);
  }

  async reorderSignVideos(senseId: string, signVideoIds: string[]) {
    const sense = await this.prisma.sense.findUnique({
      where: { id: senseId },
      include: { signVideos: true }
    });

    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    // Update priorities based on the order in the array
    const updatePromises = signVideoIds.map((signVideoId, index) => {
      return this.prisma.signVideo.update({
        where: { id: signVideoId },
        data: { priority: index + 1 }
      });
    });

    await Promise.all(updatePromises);

    return this.getGlossData(sense.glossDataId);
  }

  // Video priority management
  async updateVideoPriority(videoId: string, priority: number) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { 
        signVideo: { 
          include: { sense: true } 
        } 
      }
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    await this.prisma.video.update({
      where: { id: videoId },
      data: { priority }
    });

    return this.getGlossData(video.signVideo.sense.glossDataId);
  }

  async reorderVideos(signVideoId: string, videoIds: string[]) {
    const signVideo = await this.prisma.signVideo.findUnique({
      where: { id: signVideoId },
      include: { 
        videos: true,
        sense: true 
      }
    });

    if (!signVideo) {
      throw new NotFoundException('SignVideo not found');
    }

    // Update priorities based on the order in the array
    const updatePromises = videoIds.map((videoId, index) => {
      return this.prisma.video.update({
        where: { id: videoId },
        data: { priority: index + 1 }
      });
    });

    await Promise.all(updatePromises);

    return this.getGlossData(signVideo.sense.glossDataId);
  }
} 