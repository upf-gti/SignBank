import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGlossRequestDto } from './dto/create-gloss-request.dto';

@Injectable()
export class GlossRequestsService {
  constructor(private prisma: PrismaService) {}

  async getAllPendingRequests() {
    return this.prisma.glossRequest.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        requestedGlossData: {
          include: {
            senses: {
              include: {
                definitions: true,
                signVideos: true,
                examples: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserRequests(userId: string) {
    return this.prisma.glossRequest.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        acceptedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        deniedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        requestedGlossData: {
          include: {
            senses: {
              include: {
                definitions: true,
                signVideos: true,
                examples: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createGlossRequest(userId: string, createGlossRequestDto: CreateGlossRequestDto) {
    const { gloss, senses } = createGlossRequestDto;

    return this.prisma.glossRequest.create({
      data: {
        creator: {
          connect: {
            id: userId,
          },
        },
        requestedGlossData: {
          create: {
            gloss,
            senses: {
              create: senses.map(sense => ({
                senseTitle: sense.senseTitle,
                lexicalCategory: sense.lexicalCategory,
                senseTranslations: {
                  create: sense.senseTranslations,
                },
                examples: {
                  create: sense.examples.map(example => ({
                    example: example.example,
                    exampleVideoURL: example.exampleVideoURL,
                    exampleTranslations: {
                      create: example.exampleTranslations,
                    },
                  })),
                },
                signVideos: {
                  create: sense.signVideos.map(signVideo => ({
                    title: signVideo.title,
                    url: signVideo.url,
                    videoData: {
                      create: signVideo.videoData,
                    },
                    videos: {
                      create: signVideo.videos,
                    },
                  })),
                },
                definitions: {
                  create: sense.definitions.map(definition => ({
                    title: definition.title,
                    definition: definition.definition,
                    definitionTranslations: {
                      create: definition.definitionTranslations,
                    },
                    videoDefinition: {
                      create: definition.videoDefinition,
                    },
                  })),
                },
              })),
            },
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        requestedGlossData: {
          include: {
            senses: {
              include: {
                senseTranslations: true,
                examples: {
                  include: {
                    exampleTranslations: true,
                  },
                },
                signVideos: {
                  include: {
                    videoData: true,
                    videos: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getGlossRequest(id: string) {
    return this.prisma.glossRequest.findUnique({
      where: { id },
      include: {
        creator: true,
        acceptedBy: true,
        deniedBy: true,
        requestedGlossData: {
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
          },
        },
      },
    });
  }
} 