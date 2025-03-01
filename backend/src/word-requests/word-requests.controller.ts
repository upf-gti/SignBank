import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
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
  findAll(@GetUser('id') userId: number, @GetUser('role') role: string) {
    return this.wordRequestsService.findAll(role === 'ADMIN', userId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateWordRequestDto) {
    return this.wordRequestsService.updateStatus(+id, dto);
  }
}
