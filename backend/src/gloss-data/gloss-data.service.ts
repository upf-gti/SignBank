import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GlossDataService {
  constructor(private prisma: PrismaService) {}

  async getGlossDataById(id: string) {
    const gloss = await this.prisma.glossData.findUnique({
      where: { id },
      include: {
        senses: {
          include: {
            definitions: {
              include: {
                definitionTranslations: true,
                videoDefinition: true,
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
          },
        },
        dictionaryEntry: true,
        glossRequest: true,
      }
    });

    if (!gloss) {
      throw new NotFoundException(`GlossData with ID ${id} not found`);
    }

    return gloss;
  }

  // Sense deletion - will cascade delete related entities
  async deleteSense(id: string) {
    try {
      return await this.prisma.sense.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Sense with ID ${id} not found or could not be deleted`);
    }
  }

  // Definition deletion - will cascade delete translations
  async deleteDefinition(id: string) {
    try {
      return await this.prisma.definition.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Definition with ID ${id} not found or could not be deleted`);
    }
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
} 