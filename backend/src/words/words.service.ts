import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import typesense from 'src/typesense/client';
import { SearchParams } from 'typesense/lib/Typesense/Documents';
import { WordStatus } from '@prisma/client';
import { SearchOptions, SearchResult } from './interfaces/search.interface';

@Injectable()
export class WordsService {
  constructor(private readonly prisma: PrismaService) {}

  // Search for words using Typesense
  async searchWords(query: string, limit: number, filters?: Record<string, any>): Promise<SearchResult> {
    const searchParameters: SearchParams = {
      q: query,
      query_by: 'word',
      per_page: limit,
      num_typos: 3,
      typo_tokens_threshold: 1,  // Allow typos on queries with at least 1 token
      highlight_full_fields: 'word,senseDefinitions',
      sort_by: '_text_match:desc,word:asc',
    };

    // Add filters if provided
    if (filters) {
      const filterStr = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map(v => `${key}:=${v}`).join(' || ');
          }
          return `${key}:=${value}`;
        })
        .join(' && ');

      if (filterStr) {
        searchParameters.filter_by = filterStr;
      }
    }
    try {
      const results = await typesense
        .collections('words')
        .documents()
        .search(searchParameters);
      
      // Process hits to include only general information
      return {
        found: results.found,
        page: results.page || 1,
        hits: results.hits.map((hit) => {
          // Extract only the required fields
          const document = hit.document as Record<string, any>;
          const { 
            id, 
            word, 
            videoUrls = [],
            lexicalCategory = ''
          } = document;
          
          // Get best description from sense definitions
          let bestSenseDescription = "";
          
          // Use senseDefinitions from Typesense if available
          if (document.senseDefinitions && document.senseDefinitions.length > 0) {
            bestSenseDescription = document.senseDefinitions[0];
          }
          
          return {
            word: { 
              id, 
              word,
              description: bestSenseDescription, // Use the best sense description
              videoUrls,
              lexicalCategory
            },
            highlights: hit.highlights || [],
            textMatch: hit.text_match
          };
        })
      };
    } catch (error) {
      // Check if this is a 404 error (collection doesn't exist or is empty)
      if (error.message && error.message.includes('HTTP code 404')) {
        // Return an empty result set instead of throwing an error
        return {
          found: 0,
          page: 1,
          hits: []
        };
      }
      
      // For any other errors, rethrow with a descriptive message
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // Get full word details using Prisma
  async getWordDetailsById(wordId: string) {
    const word = await this.prisma.words.findUnique({
      where: { id: wordId },
    });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    // Transform the data to match frontend expectations
    return {
      id: word.id,
      createdAt: word.createdAt,
      updatedAt: word.updatedAt,
      status: word.status,
      currentVersion: word.currentVersion,
      ...word.wordData,
    };
  }
}
