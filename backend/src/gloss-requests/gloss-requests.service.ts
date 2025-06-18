import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGlossRequestDto } from './dto/create-gloss-request.dto';
import { AcceptGlossRequestDto } from './dto/accept-gloss-request.dto';
import { DeclineGlossRequestDto } from './dto/decline-gloss-request.dto';
import { GlossStatus, RequestStatus } from '@prisma/client';
import { UpdateSenseDto, ReorderSenseDto } from './dto/update-sense.dto';
import { validateGlossRequest } from '../utils/gloss-validation';

@Injectable()
export class GlossRequestsService {
  constructor(private prisma: PrismaService) {}

  async getAllPendingRequests() {
    return this.prisma.glossRequest.findMany({
      where: {
        status: RequestStatus.WAITING_FOR_APPROVAL,
      },
      include: {
        creator: true,
        requestedGlossData: true,
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
            name: true,
            lastName: true,
          },
        },
        acceptedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            lastName: true,
          },
        },
        deniedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            lastName: true,
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
        },
      },
    });
  }

  async createGlossRequest(userId: string, createGlossRequestDto: CreateGlossRequestDto) {
    // Create GlossData first
    const glossData = await this.prisma.glossData.create({
      data: {
        gloss: createGlossRequestDto.gloss,
        isCreatedFromRequest: true,
      },
    });

    // Create GlossRequest
    return this.prisma.glossRequest.create({
      data: {
        creatorId: userId,
        requestedGlossDataId: glossData.id,
        status: RequestStatus.NOT_COMPLETED,
      },
      include: {
        creator: true,
        requestedGlossData: true,
      },
    });
  }

  async acceptGlossRequest(
    id: string,
    userId: string,
    // acceptGlossRequestDto: AcceptGlossRequestDto,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Update the request status
      const updatedRequest = await prisma.glossRequest.update({
        where: { id },
        data: {
          status: RequestStatus.ACCEPTED,
          acceptedById: userId,
        },
      });

      const dictionaryEntry = await prisma.dictionaryEntry.create({
        data: {
          glossDataId: updatedRequest.requestedGlossDataId,
          isCreatedFromRequest: true,
          status: GlossStatus.PUBLISHED,
        },
      });

      return dictionaryEntry;
    });
  }

  async declineGlossRequest(
    id: string,
    userId: string,
    declineGlossRequestDto: DeclineGlossRequestDto,
  ) {
    return this.prisma.glossRequest.update({
      where: { id },
      data: {
        status: RequestStatus.DENIED,
        deniedById: userId,
        denyReason: declineGlossRequestDto.denyReason,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
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
    });
  }

  async submitGlossRequest(
    id: string,
    userId: string,
  ) {
    // First get the full gloss request with all nested data for validation
    const glossRequest = await this.prisma.glossRequest.findUnique({
      where: { id },
      include: {
        requestedGlossData: {
          include: {
            senses: {
              include: {
                definitions: {
                  include: {
                    definitionTranslations: true,
                  },
                },
                examples: {
                  include: {
                    exampleTranslations: true,
                  },
                },
                signVideos: {
                  include: {
                    videos: true,
                  },
                },
                senseTranslations: true,
              },
            },
          },
        },
      },
    });

    if (!glossRequest) {
      throw new NotFoundException('Gloss request not found');
    }

    // Check if the user is the creator of the request
    if (glossRequest.creatorId !== userId) {
      throw new ForbiddenException('You can only submit your own requests');
    }

    // Check if the request is in NOT_COMPLETED status
    if (glossRequest.status !== RequestStatus.NOT_COMPLETED) {
      throw new BadRequestException('Request can only be submitted when it is not completed');
    }

    // Validate the gloss request data
    const validationErrors = validateGlossRequest(glossRequest);
    
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Gloss request validation failed',
        errors: validationErrors.map(error => error.message)
      });
    }

    return this.prisma.glossRequest.update({
      where: { id },
      data: {
        status: RequestStatus.WAITING_FOR_APPROVAL,
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
                definitions: {
                  include: {
                    definitionTranslations: true,
                  },
                },
                examples: {
                  include: {
                    exampleTranslations: true,
                  },
                },
                signVideos: {
                  include: {
                    videos: true,
                  },
                },
                senseTranslations: true,
              },
            },
          },
        },
      },
    });
  }

  async addSense(requestId: string, data: UpdateSenseDto) {
    const request = await this.prisma.glossRequest.findUnique({
      where: { id: requestId },
      include: { requestedGlossData: true }
    });

    if (!request) {
      throw new NotFoundException('Gloss request not found');
    }

    const senseCount = await this.prisma.sense.count({
      where: { glossDataId: request.requestedGlossDataId }
    });

    const newSense = await this.prisma.sense.create({
      data: {
        senseTitle: data.senseTitle,
        lexicalCategory: data.lexicalCategory,
        priority: senseCount,
        glossDataId: request.requestedGlossDataId
      }
    });

    return this.getGlossRequest(requestId);
  }

  async updateSense(requestId: string, senseId: string, data: UpdateSenseDto) {
    const request = await this.prisma.glossRequest.findUnique({
      where: { id: requestId },
      include: { requestedGlossData: { include: { senses: true } } }
    });

    if (!request) {
      throw new NotFoundException('Gloss request not found');
    }

    const sense = request.requestedGlossData.senses.find(s => s.id === senseId);
    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    await this.prisma.sense.update({
      where: { id: senseId },
      data: {
        senseTitle: data.senseTitle,
        lexicalCategory: data.lexicalCategory
      }
    });

    return this.getGlossRequest(requestId);
  }

  async updateSensePriority(requestId: string, data: ReorderSenseDto) {
    const request = await this.prisma.glossRequest.findUnique({
      where: { id: requestId },
      include: { requestedGlossData: { include: { senses: true } } }
    });

    if (!request) {
      throw new NotFoundException('Gloss request not found');
    }

    const sense = request.requestedGlossData.senses.find(s => s.id === data.senseId);
    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    // Update priorities for all affected senses
    const senses = request.requestedGlossData.senses.sort((a, b) => a.priority - b.priority);
    const oldIndex = senses.findIndex(s => s.id === data.senseId);
    const newIndex = data.newPriority;

    if (oldIndex === newIndex) {
      return this.getGlossRequest(requestId);
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

    return this.getGlossRequest(requestId);
  }

  async deleteSense(requestId: string, senseId: string) {
    const request = await this.prisma.glossRequest.findUnique({
      where: { id: requestId },
      include: { requestedGlossData: { include: { senses: true } } }
    });

    if (!request) {
      throw new NotFoundException('Gloss request not found');
    }

    const sense = request.requestedGlossData.senses.find(s => s.id === senseId);
    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    // Don't allow deleting the last sense
    if (request.requestedGlossData.senses.length <= 1) {
      throw new BadRequestException('Cannot delete the last sense');
    }

    await this.prisma.sense.delete({
      where: { id: senseId }
    });

    // Update priorities for remaining senses
    const remainingSenses = request.requestedGlossData.senses
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

    return this.getGlossRequest(requestId);
  }
} 