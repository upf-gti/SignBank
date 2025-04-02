// src/word-requests/word-requests.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordRequestDto } from './dto/create-word-request.dto';
import { UpdateWordRequestDto } from './dto/update-word-request.dto';
import { TypesenseSyncService } from 'src/typesense/sync';
import { RequestStatus, WordStatus } from '@prisma/client'

@Injectable()
export class WordRequestsService {
  private readonly logger = new Logger(WordRequestsService.name);

  constructor(
    private prisma: PrismaService,
    private typesenseSync: TypesenseSyncService
  ) {}

  async create(userId: string, dto: CreateWordRequestDto) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      // Create the word request directly with all necessary fields
      const wordRequest = await prisma.wordRequest.create({
        data: {
          creatorId: userId,
          // Update to use requestedWordData
          requestedWordData: {
          word: dto.word,
          isNative: dto.isNative || true,
          register: dto.register,
          lexicalCategory: dto.lexicalCategory,
          dominantHand: dto.dominantHand,
          facialExpression: dto.facialExpression,
          hasContact: dto.hasContact,
          senses: dto.senses ? dto.senses as any : [],
          relatedWords: []
          },
          // Keep dialectId for the relation
          dialectId: dto.dialectId ? String(dto.dialectId) : undefined,
          // Missing fields with default values
          status: RequestStatus.PENDING,
        },
      });

      return wordRequest;
    });

    return transaction;
  }

  async findAll(userId: string) {
    return this.prisma.wordRequest.findMany({
      where: { creatorId: userId },
    });
  }

  async findOne(id: string) {
    return this.prisma.wordRequest.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: CreateWordRequestDto) {
    return this.prisma.wordRequest.update({
      where: { id },
      data: {
        requestedWordData: dto,
      },
    });
  }

  async findPending(userId: string) {
    const wordRequests = await this.prisma.wordRequest.findMany({
      where: { creatorId: userId, status: RequestStatus.PENDING },
    });

    const response = await Promise.all(wordRequests.map(async element => {
      const user = await this.prisma.users.findUnique({
        where: { id: element.creatorId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        }
      });
      return {
        ...element,
        user: user,
      };
    }));

    return response;
  }

  async approve(id: string, userId: string) {
    var session = await this.prisma.$transaction(async (prisma) => {
      const wordRequest = await prisma.wordRequest.findUnique({
        where: { id },
      });
      
      const newWord = await this.prisma.words.create({
        data: {
          wordData: wordRequest.requestedWordData,
          isCreatedFromRequest: true,
          isCreatedFromEdit: false,
        }
      })
      const word = await prisma.wordRequest.update({
        where: { id },
        data: { status: RequestStatus.ACCEPTED,
          acceptedBy: {
            connect: {
              id: userId
            }
          },
          activeWordId: newWord.id
        },
      });
      await this.typesenseSync.syncSingleWord(newWord.id);
    });
    return session;
  }

  async reject(id: string, reason: string, userId: string) {
    return this.prisma.wordRequest.update({
      where: { id },
      data: { status: RequestStatus.DENIED, denyReason: reason, deniedBy: { connect: { id: userId } } },
    });
  }

}
