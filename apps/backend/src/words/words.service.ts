import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import typesense from 'src/typesense/client';
import { SearchParams } from 'typesense/lib/Typesense/Documents';


@Injectable()
export class WordsService {
    constructor(private readonly prisma: PrismaService) { }

    // Search for words using Typesense
    async searchWords(query: string, limit: number) {
        const searchParameters: SearchParams = {
            q: query,
            query_by: 'word', // Fields to search
            per_page: limit,
            num_typos: 2,

        };
        try {
            const results = await typesense.collections('words').documents().search(searchParameters);
            return results.hits.map(hit => hit.document); // Returning only the documents
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    // Get full word details using Prisma
    async getWordDetails(word: string) {
        const result = await this.prisma.words.findFirst({
            where: {
                word: word,
            },
        });

        if (!result) {
            throw new NotFoundException(`Word with ID ${word} not found.`);
        }

        return result;
    }
}
