import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GlossesService {
  constructor(private prisma: PrismaService) {}

  async getGlossById(id: string) {
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
                minimalPairs: true,
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
        relatedGlosses: {
          include: {
            relatedGloss: {
              include: {
                senses: {
                  include: {
                    signVideos: true,
                  },
                },
              },
            },
          },
          omit: {
            glossId: true,
            id: true,
          },
        },
        minimalPairs: {
          include: {
            minimalPairGlossData: {
              include: {
                senses: {
                  include: {
                    signVideos: true,
                  },
                },
              },
            },
          },
          omit: {
            glossDataId: true,
            id: true,
          },
        },
        dictionaryEntry: true,
        glossRequest: true,
      },
    });

    if (!gloss) {
      throw new NotFoundException(`Gloss with ID ${id} not found`);
    }

    return gloss;
  }
} 