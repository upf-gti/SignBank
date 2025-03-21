// src/word-requests/word-requests.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordRequestDto } from './dto/create-word-request.dto';
import { UpdateWordRequestDto } from './dto/update-word-request.dto';
import { TypesenseSyncService } from 'src/typesense/sync';
import { WordStatus } from '@prisma/client'

@Injectable()
export class WordRequestsService {
  private readonly logger = new Logger(WordRequestsService.name);

  constructor(
    private prisma: PrismaService,
    private typesenseSync: TypesenseSyncService
  ) {}

  async create(userId: number, dto: CreateWordRequestDto) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      const word = await prisma.words.create({
        data: {
          word: dto.word,
          description: dto.description,
          creatorId: userId,
          dialectId: dto.dialectId,
          dominantHand: dto.dominantHand,
          facialExpression: dto.facialExpression,
          hasContact: dto.hasContact,
          isNative: dto.isNative,
          lexicalCategory: dto.lexicalCategory,
          movementType: dto.movementType,
          nonManualComponents: dto.nonManualComponents,
          phonologicalTranscription: dto.phonologicalTranscription,
          register: dto.register,
          usageEra: dto.usageEra,
          usageFrequency: dto.usageFrequency,
          morphologicalVariants: dto.morphologicalVariants,
          status: WordStatus.PENDING_REQUEST
        },
      });

      await prisma.sense.createMany({
        data: dto.senses.map(sense => ({
          ...sense,
          wordId: word.id
        }))
      });

      await prisma.translation.createMany({
        data: dto.translations.map(translation => ({
          ...translation,
          wordId: word.id
        }))
      });

      await prisma.video.createMany({
        data: dto.videos.map(video => ({
          ...video,
          wordId: word.id
        }))
      });

      await prisma.wordRelation.createMany({
        data: dto.relatedWords.map(relation => ({
          ...relation,
          wordId: word.id
        }))
      });

     const wordRequest = await prisma.wordRequest.create({
        data: {
          userId,          
          wordsId: word.id,
        },
      });

      return wordRequest;
    });

    return transaction;
  }

  async findAll(isAdmin: boolean, userId?: number) {
    if (isAdmin) {
      return this.prisma.wordRequest.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });
    }

    // If not admin, only return user's own requests
    return this.prisma.wordRequest.findMany({
      where: {
        userId,
      },
    });
  }

  async findUserRequests(userId: number) {
    return this.prisma.wordRequest.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
  
  async findPendingRequests() {
    return this.prisma.wordRequest.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async updateStatus(requestId: number, dto: UpdateWordRequestDto, adminId: number) {
    // First update the request status
    const request = await this.prisma.wordRequest.update({
      where: { id: requestId },
      data: { 
        status: dto.status,
        denyReason: dto.denyReason 
      },
    });

    // If request is accepted and createWord flag is true, create a new word
    if (dto.status === 'ACCEPTED' && dto.createWord !== false) {
      try {
        this.logger.log(`Creating word from request ${requestId}`);
        
        // Since the Prisma schema might not be fully synced yet,
        // we'll use a simpler version that works with the current schema
        // This will be replaced with the full implementation once the schema is synced
        const newWord = await this.prisma.words.create({
          data: {
            word: request.word,
            description: request.description,
            creatorId: request.userId,
          },
        });

        // Index in Typesense
        if (newWord) {
          await this.typesenseSync.syncSingleWord(newWord.id);
          this.logger.log(`Created and indexed word '${newWord.word}' from request ${requestId}`);
        }
        
        return request;
      } catch (error) {
        this.logger.error(`Error creating word from request: ${error.message}`, error.stack);
        throw error;
      }
    }

    return request;
  }

  async findOne(id: number) {
    return this.prisma.wordRequest.findUnique({
      where: { id }
    });
  }
}
