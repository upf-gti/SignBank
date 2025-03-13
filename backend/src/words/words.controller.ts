import { Controller, Get, Param, Query } from '@nestjs/common';
import { WordsService } from './words.service';
import { Public } from 'src/auth/decorator/public.decorator'

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Public()
  @Get('search')
  async searchWords(@Query('q') query: string, @Query('limit') limit = 50) {
    return this.wordsService.searchWords(query, limit);
  }

  @Public()
  @Get(':word')
  async getWordDetails(@Param('word') word: string) {
    return this.wordsService.getWordDetails(word);
  }
}
