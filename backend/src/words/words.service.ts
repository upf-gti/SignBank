import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import typesense from 'src/typesense/client';
import { SearchParams } from 'typesense/lib/Typesense/Documents';
import { WordStatus, WordEntry } from '../../types/database'; // Import types
import { SearchOptions, SearchResult } from './interfaces/search.interface';
import { MongoDBService } from '../mongodb/mongodb.service';

@Injectable()
export class WordsService {
  constructor(private readonly mongodb: MongoDBService) {}

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
            // The first element should be the highest priority definition based on our updated sync logic
            bestSenseDescription = document.senseDefinitions[0];
          }
          
          // If we still don't have a description, try to get it using the word ID
          if (!bestSenseDescription && id) {
            // We'll handle this asynchronously to avoid blocking the search results
            this.enrichWordWithDefinition(id, hit);
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

  // Helper method to fetch a full definition if needed
  private async enrichWordWithDefinition(wordId: string, hit: any): Promise<void> {
    try {
      const word = await this.getWordDetailsById(wordId);
      if (word && word.senses && word.senses.length > 0) {
        // Find the sense with the highest priority
        const highestPrioritySense = word.senses.sort((a, b) => 
          (a.priority || 999) - (b.priority || 999)
        )[0];
        
        if (highestPrioritySense && 
            highestPrioritySense.descriptions && 
            highestPrioritySense.descriptions.length > 0) {
          // Get the first description
          const topDescription = highestPrioritySense.descriptions[0];
          if (topDescription && topDescription.description) {
            // Update the hit document with the description
            if (hit.document) {
              hit.document.description = topDescription.description;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to enrich word ${wordId} with definition:`, error);
    }
  }

  // Get full word details using MongoDB directly
  async getWordDetailsById(wordId: string) {
    // Convert string ID to ObjectId
    const objectId = this.mongodb.toObjectId(wordId);
    
    // Fetch the word from MongoDB directly
    const word = await this.mongodb.words.findOne({ _id: objectId });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    // Format the document and transform the data to match frontend expectations
    const formattedWord = this.mongodb.formatDocument<WordEntry>(word);

    return {
      id: formattedWord.id,
      createdAt: formattedWord.createdAt,
      updatedAt: formattedWord.updatedAt,
      status: formattedWord.status,
      currentVersion: formattedWord.currentVersion,
      ...formattedWord.wordData,
    };
  }
}
