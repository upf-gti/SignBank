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
  async getWordDetailsById(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.getWordDetailsById(id);
  }

  @Public()
  @Get('text/:text')
  async getWordDetails(@Param('text') word: string) {
    return this.wordsService.getWordDetails(word);
  }

  @Get('id/:id')
  async getWordWithEdits(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @GetUser('role') role: string
  ) {
    const isAdmin = role === 'ADMIN';
    return this.wordsService.getWordWithEdits(id, userId, isAdmin);
  }

  @Post()
  async createWord(
    @GetUser('id') userId: number,
    @Body() data: any
  ) {
    return this.wordsService.createWord(userId, data);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async updateWordStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string
  ) {
    return this.wordsService.updateWordStatus(id, status as WordStatus);
  }

  @Get('admin/all')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAllWords(@Query('status') status?: string) {
    return this.wordsService.getAllWords(status as WordStatus);
  }

  @Get('user/mine')
  async getUserWords(@GetUser('id') userId: number) {
    return this.wordsService.getUserWords(userId);
  }

  @Public()
  @Post('advanced-search')
  async advancedSearch(@Body() searchParams: AdvancedSearchDto) {
    const {
      query,
      limit = 50,
      queryBy = ['word', 'description', 'senseDefinitions', 'translations'],
      filterBy = {},
      sortBy = '_text_match:desc,word:asc',
      page = 1,
      facetBy = []
    } = searchParams;

    return this.wordsService.advancedSearch({
      query,
      limit,
      queryBy,
      filterBy,
      sortBy,
      page,
      facetBy
    });
  }
}
