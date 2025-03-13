// src/word-requests/word-requests.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordRequestDto } from './dto/create-word-request.dto';
import { UpdateWordRequestDto } from './dto/update-word-request.dto';

@Injectable()
export class WordRequestsService {
  constructor(private prisma: PrismaService) {}

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

  async updateStatus(requestId: number, dto: UpdateWordRequestDto) {
    const request = await this.prisma.wordRequest.update({
      where: { id: requestId },
      data: { status: dto.status },
    });

    // If request is accepted, create a new word
    if (dto.status === 'ACCEPTED') {
      await this.prisma.words.create({
        data: {
          word: request.word,
          description: request.description,
          videoUrl: request.videoUrl,
        },
      });
    }

    return request;
  }

  async findOne(id: number) {
    return this.prisma.wordRequest.findUnique({
      where: { id },
    });
  }
}
