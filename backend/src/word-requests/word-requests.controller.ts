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

@Controller('word-requests')
@UseGuards(JwtGuard)
export class WordRequestsController {
  constructor(private readonly wordRequestsService: WordRequestsService) {}

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
  async updateStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateWordRequestDto,
    @GetUser('id') adminId: number
  ) {
    return this.wordRequestsService.updateStatus(id, dto, adminId);
  }
}
