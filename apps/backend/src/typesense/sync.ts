import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import typesense from './client';

@Injectable()
export class TypesenseSyncService implements OnApplicationBootstrap {
    constructor(private readonly prisma: PrismaService) { }

    // Sync words from the database to Typesense
    async syncWordsToTypesense() {
        const words = await this.prisma.words.findMany();

        if (!words || words.length === 0) {
            console.log('No words found in the database to sync.');
            return;
        }

        try {
            // Create or ensure the Typesense collection exists
            const schema: CollectionCreateSchema = {
                name: 'words',
                fields: [
                    { name: 'word', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'createdAt', type: 'string', facet: true },
                ],
            };

            try {
                // Check if the collection exists
                await typesense.collections('words').retrieve();
            } catch (err) {
                // If not, create the collection
                await typesense.collections().create(schema);
            }

            // Upsert all words into Typesense
            const documents = words.map(word => ({
                id: word.id.toString(),
                word: word.word,
                description: word.description,
                createdAt: word.createdAt.toISOString(),
            }));

            await typesense.collections('words').documents().import(documents, { action: 'upsert' });

            console.log(`Successfully synced ${documents.length} words to Typesense.`);
        } catch (error) {
            console.error('Error syncing words to Typesense:', error.message);
        }
    }

    // Automatically run on application bootstrap
    async onApplicationBootstrap() {
        console.log('Syncing database words to Typesense...');
        await this.syncWordsToTypesense();
    }
}
