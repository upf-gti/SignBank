import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { WordRequestsService } from './word-requests.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { RequestStatus, Role, User, Word } from '../../types/database';
import { UpdateWordRequestDto } from './dto/update-word-request.dto'
import { CreateWordRequestDto, WordDataDto } from './dto/create-word-request.dto'

@Controller('word-requests')
export class WordRequestsController {
  constructor(private readonly wordRequestsService: WordRequestsService) {}
  
  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser('id') userId: string, @Body() createWordRequestDto: WordDataDto) {
    return this.wordRequestsService.createWordRequest(userId, createWordRequestDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('pending')
  findPending() {
    return this.wordRequestsService.getWordRequestsByStatus(RequestStatus.PENDING);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@GetUser() user: User) {
    return this.wordRequestsService.getWordRequestsByCreator(user.id);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wordRequestsService.getWordRequestById(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/approve')
  approve(@Param('id') id: string, @GetUser('id') userId: string, @Body() word: Word) {
    return this.wordRequestsService.acceptWordRequest(id, userId, word);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/reject')
  deny(@Param('id') id: string, @Body('reason') reason: string, @GetUser('id') userId: string) {
    return this.wordRequestsService.denyWordRequest(id, userId, reason);
  }

}
