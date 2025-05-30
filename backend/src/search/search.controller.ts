import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search for glosses' })
  @ApiResponse({
    status: 200,
    description: 'Returns search results',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async search(@Query() searchQuery: SearchQueryDto) {
    return this.searchService.search(searchQuery);
  }
} 