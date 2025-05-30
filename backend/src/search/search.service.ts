import { Injectable } from '@nestjs/common';
import { TypesenseService } from '../typesense/typesense.service';
import { SearchQueryDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly typesenseService: TypesenseService) {}

  async search(searchQuery: SearchQueryDto) {
    try {
      const searchParameters = {
        q: searchQuery.query,
        query_by: 'name,definition,tags',
        page: searchQuery.page,
        per_page: searchQuery.limit,
      };

      const searchResults = await this.typesenseService.search(searchParameters);
      
      return {
        hits: searchResults.hits,
        page: searchResults.page,
        totalPages: Math.ceil(searchResults.found / searchQuery.limit),
        totalHits: searchResults.found,
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
} 