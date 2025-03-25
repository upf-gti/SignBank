import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe, Patch } from '@nestjs/common';
import { WordsService } from './words.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { WordStatus } from '@prisma/client'
import { SearchQueryDto, AdvancedSearchDto } from './dto/search.dto';

@Controller('words')
@UseGuards(JwtGuard)
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Public()
  @Get('search')
  async searchWords(@Query() searchDto: SearchQueryDto) {
    const { q, limit = 50, ...filters } = searchDto;
    return this.wordsService.searchWords(q, limit, filters);
  }

  @Public()
  @Get('details/:id')
  async getWordDetailsById(@Param('id') id: string) {
    return this.wordsService.getWordDetailsById(id);
  }
}
