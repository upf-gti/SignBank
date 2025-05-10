import { Controller, Get, Param, Query  } from '@nestjs/common';
import { WordsService } from './words.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { SearchQueryDto } from './dto/search.dto';

@Controller('words')
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
