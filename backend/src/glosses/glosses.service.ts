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
          omit: {
            id: true,
          },
        },
        minimalPairsAsSource: {
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
          omit: {
            id: true,
          },
        },
        dictionaryEntry: true,
        glossRequest: true,
      }
    });

    if (!gloss) {
      throw new NotFoundException(`Gloss with ID ${id} not found`);
    }

    return gloss;
  }
} 