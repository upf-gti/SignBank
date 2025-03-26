import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import typesense from './client';

@Injectable()
export class TypesenseSyncService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  // Sync words from the database to Typesense
  async syncWordsToTypesense() {
    const words = await this.prisma.words.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        dialect: true,
      },
    });

    if (!words || words.length === 0) {
      console.log('No words found in the database to sync.');
      return;
    }

    try {
      // Create or ensure the Typesense collection exists
      const schema: CollectionCreateSchema = {
        name: 'words',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'word', type: 'string', facet: false, sort: true },
          { name: 'createdAt', type: 'string', facet: true },
          { name: 'status', type: 'string', facet: true },
          { name: 'dialect', type: 'string', facet: true, optional: true },
          { name: 'dialectId', type: 'string', facet: true, optional: true },
          { name: 'dominantHand', type: 'string', facet: true, optional: true },
          { name: 'register', type: 'string', facet: true, optional: true },
          { name: 'isNative', type: 'bool', facet: true },
          { name: 'creatorId', type: 'string' },
          { name: 'creatorUsername', type: 'string', optional: true },
          { name: 'senseDefinitions', type: 'string[]', optional: true },
          { name: 'senseExamples', type: 'string[]', optional: true },
          { name: 'translations', type: 'string[]', optional: true },
          { name: 'relatedWords', type: 'string[]', optional: true },
          { name: 'videoUrls', type: 'string[]', optional: true },
        ],
        default_sorting_field: 'word',
        enable_nested_fields: true,
        token_separators: ['-', '_']
      };

      try {
        // Check if the collection exists
        console.log('Checking if collection exists');
        await typesense.collections('words').retrieve();
        console.log('Deleting collection');
        await typesense.collections('words').delete();
        console.log('Collection deleted');
      } catch (err) {
        // If not, create the collection
        console.log(err);
      }
      console.log('Creating collection');
      await typesense.collections().create(schema);

      // Upsert all words into Typesense
      const documents = words.map((word) => {
        // Process sense definitions and examples
        const senseTexts = [];
        const senseExamples = [];
        const allTranslations = [];
        
        word.senses?.forEach(sense => {
          // Process sense descriptions
          sense.descriptions?.forEach(desc => {
            if (desc.text) senseTexts.push(desc.text);
            if (desc.examples) senseExamples.push(...desc.examples);
            
            // Add translations linked to this sense description
            desc.translations?.forEach(translation => {
              allTranslations.push(`${translation.language}:${translation.text}`);
            });
          });
        });
        
        // Extract video URLs from all senses
        const videoUrls = [];
        word.senses?.forEach(sense => {
          sense.videos?.forEach(video => {
            if (video.url) videoUrls.push(video.url);
          });
        });
        
        // Extract related words
        const relatedWords = word.relatedWords?.map(rel => rel.wordId) || [];
        
        // Ensure all required fields have values to prevent indexing errors
        return {
          id: word.id,
          word: word.word,
          createdAt: word.createdAt.toISOString(),
          status: word.status || 'PUBLISHED',
          dialect: word.dialect?.name || '',
          dialectId: word.dialectId || '',
          dominantHand: 'UNKNOWN', // Default value for required field
          register: word.register || '',
          isNative: word.isNative || false,
          creatorId: word.creatorId || '',
          creatorUsername: word.creator?.username || '',
          senseDefinitions: senseTexts.length > 0 ? senseTexts : [''],
          senseExamples: senseExamples.length > 0 ? senseExamples : [''],
          translations: allTranslations.length > 0 ? allTranslations : [''],
          relatedWords: relatedWords,
          videoUrls: videoUrls,
        };
      });

      // Split into chunks to handle potential size limitations
      const chunkSize = 100;
      for (let i = 0; i < documents.length; i += chunkSize) {
        const chunk = documents.slice(i, i + chunkSize);
        try {
          await typesense
            .collections('words')
            .documents()
            .import(chunk, { action: 'upsert' });
          console.log(`Successfully synced ${chunk.length} words to Typesense (chunk ${i/chunkSize + 1}).`);
        } catch (error) {
          console.error(`Error syncing chunk ${i/chunkSize + 1} to Typesense:`, error.message);
          
          // Try to import documents one by one if batch fails
          console.log('Trying individual import for failed chunk...');
          for (const doc of chunk) {
            try {
              await typesense.collections('words').documents().upsert(doc);
              console.log(`Successfully synced word ${doc.word} individually.`);
            } catch (docError) {
              console.error(`Error syncing individual word ${doc.word}:`, docError.message);
            }
          }
        }
      }

      console.log(`Completed sync of ${documents.length} words to Typesense.`);
    } catch (error) {
      console.error('Error syncing words to Typesense:', error.message);
    }
  }

  // Automatically run on application bootstrap
  async onApplicationBootstrap() {
    console.log('Syncing database words to Typesense...');
    await this.syncWordsToTypesense();
  }

  async syncSingleWord(wordId: string) {
    try {
      const word = await this.prisma.words.findUnique({
        where: { id: wordId },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
            },
          },
          dialect: true,
        },
      });

      if (!word) {
        console.log(`Word with ID ${wordId} not found.`);
        return;
      }

      // Process sense definitions and examples
      const senseTexts = [];
      const senseExamples = [];
      const allTranslations = [];
      
      word.senses?.forEach(sense => {
        // Process sense descriptions
        sense.descriptions?.forEach(desc => {
          if (desc.text) senseTexts.push(desc.text);
          if (desc.examples) senseExamples.push(...desc.examples);
          
          // Add translations linked to this sense description
          desc.translations?.forEach(translation => {
            allTranslations.push(`${translation.language}:${translation.text}`);
          });
        });
      });
      
      // Extract video URLs from all senses
      const videoUrls = [];
      word.senses?.forEach(sense => {
        sense.videos?.forEach(video => {
          if (video.url) videoUrls.push(video.url);
        });
      });
      
      // Extract related words
      const relatedWords = word.relatedWords?.map(rel => rel.wordId) || [];

      // Ensure all required fields have values to prevent indexing errors
      const document = {
        id: word.id,
        word: word.word,
        createdAt: word.createdAt.toISOString(),
        status: word.status || 'PUBLISHED',
        dialect: word.dialect?.name || '',
        dialectId: word.dialectId || '',
        dominantHand: 'UNKNOWN', // Default value for required field
        register: word.register || '',
        isNative: word.isNative || false,
        creatorId: word.creatorId || '',
        creatorUsername: word.creator?.username || '',
        senseDefinitions: senseTexts.length > 0 ? senseTexts : [''],
        senseExamples: senseExamples.length > 0 ? senseExamples : [''],
        translations: allTranslations.length > 0 ? allTranslations : [''],
        relatedWords: relatedWords,
        videoUrls: videoUrls,
      };

      await typesense
        .collections('words')
        .documents()
        .upsert(document);

      console.log(`Successfully synced word ${word.word} to Typesense.`);
    } catch (error) {
      console.error('Error syncing word to Typesense:', error.message);
    }
  }
}
