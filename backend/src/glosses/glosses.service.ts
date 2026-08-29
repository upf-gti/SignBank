import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossStatus } from '@prisma/client'
import { compoundPartsInclude } from './compound-include';
import { flattenPhonologyInTree, videoDataPhonologyInclude } from '../phonology-values/phonology-video-data';

@Injectable()
export class GlossesService {
  constructor(private prisma: PrismaService) {}

  async getGlossById(id: string) {
    const gloss = await this.prisma.glossData.findUnique({
      where: { id },
      include: {
        definitions: {
          orderBy: { priority: 'asc' },
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
        compoundParts: compoundPartsInclude,
        glossVideos: {
          include: {
            videos: true,
            videoData: { include: videoDataPhonologyInclude },
          },
        },
        relationsAsSource: {
          include: {
            targetGloss: {
              include: {
                glossVideos: {
                  include: {
                    videos: true,
                    videoData: { include: videoDataPhonologyInclude },
                  },
                },
              },
            },
          },
          where: {
            targetGloss: {
              dictionaryEntry: {
                status: GlossStatus.PUBLISHED
              }
            },
          },
          omit: {
            id: true,
          },
        },
        relationsAsTarget: {
          include: {
            sourceGloss: {
              include: {
                glossVideos: {
                  include: {
                    videos: true,
                    videoData: { include: videoDataPhonologyInclude },
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
                glossVideos: {
                  include: {
                    videos: true,
                    videoData: { include: videoDataPhonologyInclude },
                  },
                },
              },
            },
          },
          where: {
            targetGloss: {
              dictionaryEntry: {
                status: GlossStatus.PUBLISHED
              }
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

    return flattenPhonologyInTree(gloss);
  }
} 