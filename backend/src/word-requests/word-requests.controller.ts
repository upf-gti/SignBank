import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { WordRequestsService } from './word-requests.service';
import { CreateWordRequestDto } from './dto/create-word-request.dto';
import { UpdateWordRequestDto } from './dto/update-word-request.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { PrismaService } from 'src/prisma/prisma.service'
import { TypesenseSyncService } from 'src/typesense/sync'

@Controller('word-requests')
@UseGuards(JwtGuard)
export class WordRequestsController {
  constructor(private readonly wordRequestsService: WordRequestsService, private prisma: PrismaService, private typesenseSync: TypesenseSyncService) {}

  @Post()
  create(@GetUser('id') userId: number, @Body() dto: CreateWordRequestDto) {
    return this.wordRequestsService.create(userId, dto);
  }

  @Get()
  getUserRequests(@GetUser('id') userId: number) {
    return this.wordRequestsService.findUserRequests(userId);
  }

  @Get('pending')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getPendingRequests() {
    return this.wordRequestsService.findPendingRequests();
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWordRequestDto) {
    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const wordRequest = await tx.wordRequest.update({
        where: { id },
        data: {
          status: dto.status,
          denyReason: dto.denyReason
         }
      });

      if (dto.status === 'ACCEPTED') {
        const newWord = await tx.words.create({
          data: {
            word: wordRequest.word,
            description: wordRequest.description,
            videoUrl: wordRequest.videoUrl,
          }
        });
        if (newWord) {
          await this.typesenseSync.syncSingleWord(newWord);
        }
      }

      return wordRequest;
    });

    

    return updatedRequest;
  }
}
