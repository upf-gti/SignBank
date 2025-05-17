import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GlossesService {
  constructor(private prisma: PrismaService) {}

  async getGlossById(id: string) {
    const gloss = await this.prisma.gloss.findUnique({
      where: { id },
      include: {
        sense: {
          include: {
                definitions: {
                  include: {
                    translations: true,
                    examples: true,
                    videoDefinition: true,
                  },
                },
                signVideos: {
                  include: {
                    videos: true,
                    minimalPairs: true,
                  },
                },
              },
            },
            RelatedGloss: true,
          },
    });

    if (!gloss) {
      throw new NotFoundException(`Gloss with ID ${id} not found`);
    }

    return gloss;
  }
} 