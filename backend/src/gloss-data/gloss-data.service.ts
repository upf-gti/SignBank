import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSenseDto, ReorderSenseDto } from './dto/update-sense.dto';
import { UpdateDefinitionDto, UpdateDefinitionTranslationDto } from './dto/update-definition.dto';

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

  // Example deletion - will cascade delete translations
  async deleteExample(id: string) {
    try {
      return await this.prisma.example.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Example with ID ${id} not found or could not be deleted`);
    }
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
    try {
      return await this.prisma.senseTranslation.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`SenseTranslation with ID ${id} not found or could not be deleted`);
    }
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

  // ExampleTranslation deletion
  async deleteExampleTranslation(id: string) {
    try {
      return await this.prisma.exampleTranslation.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`ExampleTranslation with ID ${id} not found or could not be deleted`);
    }
  }

  // Related Gloss deletion
  async deleteRelatedGloss(id: string) {
    try {
      return await this.prisma.relatedGloss.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`RelatedGloss with ID ${id} not found or could not be deleted`);
    }
  }

  // Minimal Pair deletion
  async deleteMinimalPair(id: string) {
    try {
      return await this.prisma.minimalPair.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`MinimalPair with ID ${id} not found or could not be deleted`);
    }
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
} 