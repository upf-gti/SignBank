import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import { WordRequestsService } from './word-requests.service';
import { CreateWordRequestDto } from './dto/create-word-request.dto';
import { UpdateWordRequestDto } from './dto/update-word-request.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Role, Users } from '@prisma/client'

@Controller('word-requests')
@UseGuards(JwtGuard)
export class WordRequestsController {
  constructor(private readonly wordRequestsService: WordRequestsService) {}

  @Post()
  create(
    @GetUser('id') userId: string,
    @Body() createWordRequestDto: CreateWordRequestDto
  ) {
    console.log(createWordRequestDto);
    return this.wordRequestsService.create(userId, createWordRequestDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.wordRequestsService.findAll(userId);
  }

  @Get('pending')
  findPending(@GetUser('id') userId: string) {
    return this.wordRequestsService.findPending(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: Users) {
    const wordRequest = await this.wordRequestsService.findOne(id);
    if (!wordRequest) {
      return null;
    }
    if (wordRequest.creatorId !== user.id && user.role !== Role.ADMIN) {
      throw new UnauthorizedException('You do not have permission to view this word request');
    }
    return wordRequest;
  }

  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  approve(@Param('id') id: string, @GetUser() user: Users) {
    return this.wordRequestsService.approve(id, user.id);
  }

  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  reject(@Param('id') id: string, @Body() body: { reason: string }, @GetUser() user: Users) {
    return this.wordRequestsService.reject(id, body.reason, user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateWordRequestDto: CreateWordRequestDto) {
    return this.wordRequestsService.update(id, updateWordRequestDto);
  }

}
