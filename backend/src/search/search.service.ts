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
        query_by: 'gloss,signVideoTitle,configuration,configurationChanges,description,relationBetweenArticulators,location,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType,hands',
        filter_by: searchQuery.filter_by,
        facet_by: searchQuery.facet_by,
        page: searchQuery.page,
        per_page: searchQuery.limit,
      };

      const searchResults = await this.typesenseService.search(searchParameters);
      
      return {
        hits: searchResults.hits,
        page: searchResults.page,
        found: searchResults.found,
        facet_counts: searchResults.facet_counts
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
} 