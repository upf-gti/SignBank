import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
        senses: {
          include: {
            Translation: true,
          }
        },
        translations: true,
        videos: true,
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
          { name: 'description', type: 'string' },
          { name: 'createdAt', type: 'string', facet: true },
          { name: 'status', type: 'string', facet: true },
          { name: 'dialect', type: 'string', facet: true },
          { name: 'dialectId', type: 'int32', facet: true },
          { name: 'lexicalCategory', type: 'string', facet: true },
          { name: 'register', type: 'string', facet: true },
          { name: 'movementType', type: 'string', facet: true },
          { name: 'hasContact', type: 'bool', facet: true },
          { name: 'facialExpression', type: 'string', facet: true },
          { name: 'dominantHand', type: 'string', facet: true },
          { name: 'morphologicalVariants', type: 'string' },
          { name: 'phonologicalTranscription', type: 'string' },
          { name: 'usageFrequency', type: 'string', facet: true },
          { name: 'usageEra', type: 'string', facet: true },
          { name: 'isNative', type: 'bool', facet: true },
          { name: 'creatorId', type: 'int32' },
          { name: 'creatorUsername', type: 'string' },
          { name: 'senseDefinitions', type: 'string[]' },
          { name: 'senseExamples', type: 'string[]' },
          { name: 'translations', type: 'string[]' },
          { name: 'relatedWords', type: 'string[]' },
          { name: 'videoUrls', type: 'string[]' },
          { name: 'nonManualComponents', type: 'string' }
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
        // Process sense-specific translations
        const allTranslations = [];
        const senseTexts = [];
        const senseExamples = [];
        
        word.senses?.forEach(sense => {
          if (sense.definition) senseTexts.push(sense.definition);
          if (sense.example) senseExamples.push(sense.example);
          
          // Add translations linked to this sense
          sense.Translation?.forEach(translation => {
            allTranslations.push(`${translation.language}:${translation.text}`);
          });
        });
        
        // Add any word-level translations (if present in database)
        word.translations?.forEach(translation => {
          allTranslations.push(`${translation.language}:${translation.text}`);
        });
        
        return {
          id: word.id.toString(),
          word: word.word,
          description: word.description,
          createdAt: word.createdAt.toISOString(),
          status: word.status,
          dialect: word.dialect?.name,
          dialectId: word.dialectId,
          lexicalCategory: word.lexicalCategory,
          register: word.register,
          movementType: word.movementType,
          hasContact: word.hasContact,
          facialExpression: word.facialExpression,
          nonManualComponents: word.nonManualComponents,
          dominantHand: word.dominantHand,
          morphologicalVariants: word.morphologicalVariants,
          phonologicalTranscription: word.phonologicalTranscription,
          usageFrequency: word.usageFrequency,
          usageEra: word.usageEra,
          isNative: word.isNative,
          creatorId: word.creatorId,
          creatorUsername: word.creator?.username,
          senseDefinitions: senseTexts,
          senseExamples: senseExamples,
          translations: allTranslations,
          relatedWords: word.relatedWords?.map(rel => rel.targetWord.word) || [],
          videoUrls: word.videos?.map(video => video.url) || []
        };
      });

      await typesense
        .collections('words')
        .documents()
        .import(documents, { action: 'upsert' });

      console.log(
        `Successfully synced ${documents.length} words to Typesense.`,
      );
    } catch (error) {
      console.error('Error syncing words to Typesense:', error.message);
    }
  }

  // Automatically run on application bootstrap
  async onApplicationBootstrap() {
    console.log('Syncing database words to Typesense...');
    await this.syncWordsToTypesense();
  }

  async syncSingleWord(wordId: number) {
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
          senses: {
            include: {
              Translation: true,
            }
          },
          translations: true,
          videos: true,
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

      if (!word) {
        console.log(`Word with ID ${wordId} not found.`);
        return;
      }

      // Process sense-specific translations
      const allTranslations = [];
      const senseTexts = [];
      const senseExamples = [];
      
      word.senses?.forEach(sense => {
        if (sense.definition) senseTexts.push(sense.definition);
        if (sense.example) senseExamples.push(sense.example);
        
        // Add translations linked to this sense
        sense.Translation?.forEach(translation => {
          allTranslations.push(`${translation.language}:${translation.text}`);
        });
      });
      
      // Add any word-level translations
      word.translations?.forEach(translation => {
        allTranslations.push(`${translation.language}:${translation.text}`);
      });

      const document = {
        id: word.id.toString(),
        word: word.word,
        description: word.description,
        createdAt: word.createdAt.toISOString(),
        status: word.status,
        dialect: word.dialect?.name,
        dialectId: word.dialectId,
        lexicalCategory: word.lexicalCategory,
        register: word.register,
        movementType: word.movementType,
        hasContact: word.hasContact,
        facialExpression: word.facialExpression,
        nonManualComponents: word.nonManualComponents,
        dominantHand: word.dominantHand,
        morphologicalVariants: word.morphologicalVariants,
        phonologicalTranscription: word.phonologicalTranscription,
        usageFrequency: word.usageFrequency,
        usageEra: word.usageEra,
        isNative: word.isNative,
        creatorId: word.creatorId,
        creatorUsername: word.creator?.username,
        senseDefinitions: senseTexts,
        senseExamples: senseExamples,
        translations: allTranslations,
        relatedWords: word.relatedWords?.map(rel => rel.targetWord.word) || [],
        videoUrls: word.videos?.map(video => video.url) || []
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
