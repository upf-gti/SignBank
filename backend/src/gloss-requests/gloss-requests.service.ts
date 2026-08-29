import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGlossRequestDto } from './dto/create-gloss-request.dto';
import { DeclineGlossRequestDto } from './dto/decline-gloss-request.dto';
import { GlossStatus, RequestStatus } from '@prisma/client';
import { validateGlossRequest } from '../utils/gloss-validation';
import { GLOSS_SEARCH_SYNC_EVENT } from '../typesense/types/gloss-index.type';
import { flattenPhonologyInTree, videoDataPhonologyInclude } from '../phonology-values/phonology-video-data';

const requestedGlossDataInclude = {
  definitions: {
    orderBy: { priority: 'asc' as const },
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
  glossVideos: {
    include: {
      videos: true,
      videoData: { include: videoDataPhonologyInclude },
    },
  },
  minimalPairsAsSource: {
    include: {
      sourceGloss: { include: { glossVideos: true } },
      targetGloss: { include: { glossVideos: true } },
    },
  },
  relationsAsSource: {
    include: {
      targetGloss: { include: { glossVideos: true } },
    },
  },
  relationsAsTarget: {
    include: {
      sourceGloss: { include: { glossVideos: true } },
    },
  },
};

@Injectable()
export class GlossRequestsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllPendingRequests() {
    return this.prisma.glossRequest.findMany({
      where: { status: RequestStatus.WAITING_FOR_APPROVAL },
      include: { creator: true, requestedGlossData: true },
    });
  }

  async getUserRequests(userId: string) {
    return this.prisma.glossRequest.findMany({
      where: { creatorId: userId },
      include: {
        creator: {
          select: { id: true, username: true, email: true, name: true, lastName: true },
        },
        acceptedBy: {
          select: { id: true, username: true, name: true, lastName: true },
        },
        deniedBy: {
          select: { id: true, username: true, name: true, lastName: true },
        },
        requestedGlossData: {
          include: {
            definitions: true,
            examples: true,
            glossVideos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGlossRequest(id: string) {
    const request = await this.prisma.glossRequest.findUnique({
      where: { id },
      include: {
        creator: true,
        acceptedBy: true,
        deniedBy: true,
        requestedGlossData: { include: requestedGlossDataInclude },
      },
    });
    return flattenPhonologyInTree(request);
  }

  async createGlossRequest(userId: string, createGlossRequestDto: CreateGlossRequestDto) {
    const glossData = await this.prisma.glossData.create({
      data: {
        gloss: createGlossRequestDto.gloss,
        isCreatedFromRequest: true,
      },
    });

    return this.prisma.glossRequest.create({
      data: {
        creatorId: userId,
        requestedGlossDataId: glossData.id,
        status: RequestStatus.NOT_COMPLETED,
      },
      include: { creator: true, requestedGlossData: true },
    });
  }

  async acceptGlossRequest(id: string, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const updatedRequest = await prisma.glossRequest.update({
        where: { id },
        data: {
          status: RequestStatus.ACCEPTED,
          acceptedById: userId,
        },
      });

      return prisma.dictionaryEntry.create({
        data: {
          glossDataId: updatedRequest.requestedGlossDataId,
          isCreatedFromRequest: true,
          status: GlossStatus.PUBLISHED,
        },
      });
    }).then((dictionaryEntry) => {
      this.eventEmitter.emit(GLOSS_SEARCH_SYNC_EVENT, {
        glossDataId: dictionaryEntry.glossDataId,
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
        creator: { select: { id: true, username: true, email: true } },
        deniedBy: { select: { id: true, username: true } },
        requestedGlossData: {
          include: {
            glossVideos: true,
            definitions: true,
            examples: true,
          },
        },
      },
    });
  }

  async submitGlossRequest(id: string, userId: string) {
    const glossRequest = await this.prisma.glossRequest.findUnique({
      where: { id },
      include: {
        requestedGlossData: { include: requestedGlossDataInclude },
      },
    });

    if (!glossRequest) {
      throw new NotFoundException('Gloss request not found');
    }

    if (glossRequest.creatorId !== userId) {
      throw new ForbiddenException('You can only submit your own requests');
    }

    if (glossRequest.status !== RequestStatus.NOT_COMPLETED) {
      throw new BadRequestException('Request can only be submitted when it is not completed');
    }

    const validationErrors = validateGlossRequest(glossRequest);
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Gloss request validation failed',
        errors: validationErrors.map((error) => error.message),
      });
    }

    return flattenPhonologyInTree(
      await this.prisma.glossRequest.update({
        where: { id },
        data: { status: RequestStatus.WAITING_FOR_APPROVAL },
        include: {
          creator: { select: { id: true, username: true, email: true } },
          requestedGlossData: { include: requestedGlossDataInclude },
        },
      }),
    );
  }
}
