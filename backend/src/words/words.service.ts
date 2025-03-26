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
      query_by: 'word,senseDefinitions,description',
      per_page: limit,
      num_typos: 2,
      highlight_full_fields: 'word,description,senseDefinitions',
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
    console.log(searchParameters);
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
            description, 
            videoUrls = [] 
          } = document;
          
          // Get senses or empty array if none exists
          const senses = document.senses || [];
          
          // Find the most important sense based on priority
          let bestSenseDescription = description;
          
          if (senses.length > 0) {
            // Sort senses by priority (lower number = higher priority)
            const sortedSenses = [...senses].sort((a, b) => (a.priority || 0) - (b.priority || 0));
            const primarySense = sortedSenses[0];
            
            // If the primary sense has descriptions, use the first one
            if (primarySense && primarySense.descriptions && primarySense.descriptions.length > 0) {
              bestSenseDescription = primarySense.descriptions[0].text;
            }
          }
          
          return {
            word: { 
              id, 
              word, 
              description: bestSenseDescription, // Use the best sense description instead of general description
              videoUrls,
              senses: document.senses
            },
            highlights: hit.highlights || [],
            textMatch: hit.text_match
          };
        })
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // Get full word details using Prisma
  async getWordDetailsById(wordId: string) {
    console.log(wordId);
    const word = await this.prisma.words.findUnique({
      where: { id: wordId },
    });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    return word;
    
  }
}
