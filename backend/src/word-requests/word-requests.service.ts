// src/word-requests/word-requests.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordRequestDto } from './dto/create-word-request.dto';
import { UpdateWordRequestDto } from './dto/update-word-request.dto';
import { TypesenseSyncService } from 'src/typesense/sync';

@Injectable()
export class WordRequestsService {
  private readonly logger = new Logger(WordRequestsService.name);

  constructor(
    private prisma: PrismaService,
    private typesenseSync: TypesenseSyncService
  ) {}

  async create(userId: number, dto: CreateWordRequestDto) {
    return this.prisma.wordRequest.create({
      data: {
        ...dto,
        userId,
      },
    });
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
