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
      query_by: 'word,description,senseDefinitions,translations',
      per_page: limit,
      num_typos: 2,
      highlight_full_fields: 'word,description',
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
            description, 
            videoUrls = [] 
          } = document;
          
          return {
            word: { 
              id, 
              word, 
              description, 
              videoUrls 
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
  async getWordDetails(word: string) {
    const result = await this.prisma.words.findFirst({
      where: {
        word: word,
        status: 'PUBLISHED', // Only return published words for public API
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        dialect: true,
        videos: {
          orderBy: {
            priority: 'asc'
          }
        },
        senses: {
          include: {
            Translation: true
          },
          orderBy: {
            priority: 'asc'
          }
        },
        translations: true,
        relatedWords: {
          include: {
            targetWord: {
              select: {
                id: true,
                word: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Word with ID ${word} not found.`);
    }

    return result;
  }

  // Get word details by ID (public version)
  async getWordDetailsById(id: number) {
    const result = await this.prisma.words.findUnique({
      where: {
        id: id,
        status: 'PUBLISHED', // Only return published words for public API
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        dialect: true,
        videos: {
          orderBy: {
            priority: 'asc'
          }
        },
        senses: {
          include: {
            Translation: true
          },
          orderBy: {
            priority: 'asc'
          }
        },
        translations: true,
        relatedWords: {
          include: {
            targetWord: {
              select: {
                id: true,
                word: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Word with ID ${id} not found.`);
    }

    return result;
  }

  // Get word with edits for admin or owner
  async getWordWithEdits(wordId: number, userId: number, isAdmin: boolean) {
    const word = await this.prisma.words.findUnique({
      where: { id: wordId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        edits: {
          include: {
            editor: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        dialect: true,
        videos: {
          orderBy: {
            priority: 'asc'
          }
        },
        senses: {
          include: {
            Translation: true
          },
          orderBy: {
            priority: 'asc'
          }
        },
        translations: true,
        relatedWords: {
          include: {
            targetWord: {
              select: {
                id: true,
                word: true,
              },
            },
          },
        },
        originalRequest: true,
      },
    });

    if (!word) {
      throw new NotFoundException(`Word with ID ${wordId} not found.`);
    }

    // If not admin and not creator, only return public info
    if (!isAdmin && word.creatorId !== userId) {
      if (word.status !== 'PUBLISHED') {
        throw new ForbiddenException('You do not have access to this word.');
      }
      
      // Return without edits
      delete word.edits;
    }

    return word;
  }

  // Create a new word (public words should go through WordRequest)
  async createWord(userId: number, data: any) {
    return this.prisma.words.create({
      data: {
        ...data,
        creator: {
          connect: { id: userId },
        },
      },
    });
  }

  // Update word status (admin only)
  async updateWordStatus(wordId: number, status: WordStatus) {
    return this.prisma.words.update({
      where: { id: wordId },
      data: { status },
    });
  }

  // Get all words for admin dashboard
  async getAllWords(status?: WordStatus) {
    const where = status ? { status } : {};
    
    return this.prisma.words.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            edits: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get words created by a specific user
  async getUserWords(userId: number) {
    return this.prisma.words.findMany({
      where: {
        creatorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Advanced search with more flexible parameters
  async advancedSearch(options: SearchOptions): Promise<SearchResult> {
    const { query, limit, queryBy, filterBy, sortBy, page, facetBy } = options;

    const searchParameters: SearchParams = {
      q: query,
      query_by: queryBy.join(','),
      per_page: limit,
      page,
      sort_by: sortBy,
      highlight_full_fields: queryBy.join(','),
      num_typos: 2,
    };

    // Add facets if requested
    if (facetBy.length > 0) {
      searchParameters.facet_by = facetBy.join(',');
    }

    // Build filter string
    if (Object.keys(filterBy).length > 0) {
      const filterStr = Object.entries(filterBy)
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
      
      return {
        found: results.found,
        page: results.page,
        hits: results.hits.map((hit) => {
          // Extract only the required fields
          const document = hit.document as Record<string, any>;
          const { 
            id, 
            word, 
            description, 
            videoUrls = [] 
          } = document;
          
          return {
            word: { 
              id, 
              word, 
              description, 
              videoUrls 
            },
            highlights: hit.highlights || [],
            textMatch: hit.text_match
          };
        }),
        facets: results.facet_counts || []
      };
    } catch (error) {
      throw new Error(`Advanced search failed: ${error.message}`);
    }
  }
}
