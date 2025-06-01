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
    const { gloss, senses, minimalPairsAsSource, relationsAsSource } = createGlossRequestDto;
  
    return this.prisma.$transaction(async (prisma) => {
      // Step 1: Create GlossRequest without minimalPairs/relatedGlosses
      const glossRequest = await prisma.glossRequest.create({
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
          requestedGlossData: true,
        },
      });

      const glossDataId = glossRequest.requestedGlossData.id;
    
      // Step 2: Add minimalPairs and relatedGlosses if they exist
      if (minimalPairsAsSource && minimalPairsAsSource.length > 0) {
        for (const pair of minimalPairsAsSource) {
          // Verify that the target GlossData exists
          const targetGloss = await prisma.glossData.findUnique({
            where: { id: pair.targetGlossId }
          });

          if (!targetGloss) {
            throw new Error(`GlossData with id ${pair.targetGlossId} not found`);
          }

          await prisma.minimalPair.create({
            data: {
              distinction: pair.distinction,
              sourceGlossId: glossDataId,
              targetGlossId: pair.targetGlossId 
            }
          });
        }
      }
    
      if (relationsAsSource && relationsAsSource.length > 0) {
        for (const related of relationsAsSource) {
          // Verify that the target GlossData exists
          const targetGloss = await prisma.glossData.findUnique({
            where: { id: related.targetGlossId }
          });

          if (!targetGloss) {
            throw new Error(`GlossData with id ${related.targetGlossId} not found`);
          }

          await prisma.relatedGloss.create({
            data: {
              relationType: related.relationType,
              sourceGlossId: glossDataId,
              targetGlossId: related.targetGlossId
            }
          });
        }
      }
    
      // Return the full GlossRequest with all relations
      return prisma.glossRequest.findUnique({
        where: { id: glossRequest.id },
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
              minimalPairsAsSource: {
                include: {
                  sourceGloss: true,
                  targetGloss: true
                }
              },
              minimalPairsAsTarget: {
                include: {
                  targetGloss: true,
                  sourceGloss: true
                }
              },
              relationsAsSource: {
                include: {
                  targetGloss: true,
                  sourceGloss: true
                }
              },
              relationsAsTarget: {
                include: {
                  sourceGloss: true,
                  targetGloss: true
                }
              }
            },
          },
        }
      });
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
                sourceGloss: true,
                targetGloss: true
              }
            },
            minimalPairsAsTarget: {
              include: {
                targetGloss: true,
                sourceGloss: true
              }
            },
            dictionaryEntry: true,
          },
        },
      },
    });
  }
} 