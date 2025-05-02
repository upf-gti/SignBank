import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import typesense from './client';
import { WordEntry, WordStatus } from '../../types/database';

@Injectable()
export class TypesenseSyncService implements OnApplicationBootstrap {
  constructor(private readonly mongodb: MongoDBService) {}

  // Sync words from the database to Typesense
  async syncWordsToTypesense() {
    // Use the service's function to find all word entries
    const words = await this.findAllPublishedWords();
    console.log(words);
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
          { name: 'word', type: 'string', facet: false, sort: true, infix: true },
          { name: 'createdAt', type: 'string', facet: true },
          { name: 'status', type: 'string', facet: true },
          { name: 'dialect', type: 'string', facet: true, optional: true },
          { name: 'dialectId', type: 'string', facet: true, optional: true },
          { name: 'dominantHand', type: 'string', facet: true, optional: true },
          { name: 'register', type: 'string', facet: true, optional: true },
          { name: 'isNative', type: 'bool', facet: true },
          { name: 'creatorId', type: 'string', optional: true },
          { name: 'creatorUsername', type: 'string', optional: true },
          { name: 'senseDefinitions', type: 'string[]', optional: true },
          { name: 'senseExamples', type: 'string[]', optional: true },
          { name: 'translations', type: 'string[]', optional: true },
          { name: 'relatedWords', type: 'string[]', optional: true },
          { name: 'videoUrls', type: 'string[]', optional: true },
          { name: 'lexicalCategory', type: 'string', facet: true, optional: true },
        ],
        default_sorting_field: 'word',
        enable_nested_fields: true,
        token_separators: ['-', '_', ' '],
        symbols_to_index: ['*']
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
        // Get the wordData from the embedded type
        const wordData = word.wordData;
        if (!wordData) {
          console.log(`Word ${word.id} has no wordData`, word);
          return null;
        }

        // Get definitions organized by priority
        const definitionsByPriority = this.getDefinitionsByPriority(wordData.senses);
        
        // Process sense examples and translations
        const senseExamples = [];
        const allTranslations = [];
        
        wordData.senses?.forEach(sense => {
          // Process sense descriptions
          sense.descriptions?.forEach(desc => {
            if (desc.examples) senseExamples.push(...desc.examples);
            
            // Add translations linked to this sense description
            desc.translations?.forEach(translation => {
              allTranslations.push(`${translation.language}:${translation.translation}`);
            });
          });
        });
        
        // Extract video URLs from all senses
        const videoUrls = [];
        wordData.senses?.forEach(sense => {
          sense.videos?.forEach(video => {
            if (video.url) videoUrls.push(video.url);
          });
        });
        
        // Extract related words
        const relatedWords = wordData.relatedWords?.map(rel => rel.wordId) || [];
        
        // Create the document with required fields
        const doc: any = {
          id: word.id,
          word: wordData.word,
          createdAt: word.createdAt,
          status: word.status || 'PUBLISHED',
          isNative: wordData.isNative || false,
          senseDefinitions: definitionsByPriority.length > 0 ? definitionsByPriority : [''],
          senseExamples: senseExamples.length > 0 ? senseExamples : [''],
          translations: allTranslations.length > 0 ? allTranslations : [''],
          relatedWords: relatedWords,
          videoUrls: videoUrls
        };
        
        // Add lexical category if it exists in the wordData
        if ((wordData as any).lexicalCategory) {
          doc.lexicalCategory = (wordData as any).lexicalCategory;
        }
        
        return doc;
      }).filter(Boolean); // Filter out null values

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

  // Helper method to get definitions sorted by priority
  private getDefinitionsByPriority(senses: any[] = []): string[] {
    if (!senses || senses.length === 0) return [];
    
    // Sort senses by priority (lower number = higher priority)
    const sortedSenses = [...senses].sort((a, b) => {
      const priorityA = a.priority !== undefined ? a.priority : 999;
      const priorityB = b.priority !== undefined ? b.priority : 999;
      return priorityA - priorityB;
    });
    
    // Extract definitions from sorted senses
    const definitions: string[] = [];
    
    sortedSenses.forEach(sense => {
      if (sense.descriptions && sense.descriptions.length > 0) {
        sense.descriptions.forEach(desc => {
          if (desc.description) {
            definitions.push(desc.description);
          }
        });
      }
    });
    
    return definitions;
  }

  // Fetch all published words
  private async findAllPublishedWords(): Promise<WordEntry[]> {
    try {
      const rawWords = await this.mongodb.words.find({
        status: WordStatus.PUBLISHED
      }).toArray();
      return rawWords.map(word => this.mongodb.formatDocument<WordEntry>(word));
    } catch (error) {
      console.error('Error fetching published words:', error);
      return [];
    }
  }

  // Automatically run on application bootstrap
  async onApplicationBootstrap() {
    console.log('Syncing database words to Typesense...');
    await this.syncWordsToTypesense();
  }

  async syncSingleWord(wordId: string) {
    try {
      // Use the service's method to find a word by ID
      const word = await this.findWordById(wordId);

      if (!word) {
        console.log(`Word with ID ${wordId} not found.`);
        return;
      }

      // Get the wordData from the embedded type
      const wordData = word.wordData;
      if (!wordData) {
        console.log(`Word ${word.id} has no wordData`);
        return;
      }

      // Get definitions organized by priority
      const definitionsByPriority = this.getDefinitionsByPriority(wordData.senses);
      
      // Process sense examples and translations
      const senseExamples = [];
      const allTranslations = [];
      
      wordData.senses?.forEach(sense => {
        // Process sense descriptions
        sense.descriptions?.forEach(desc => {
          if (desc.examples) senseExamples.push(...desc.examples);
          
          // Add translations linked to this sense description
          desc.translations?.forEach(translation => {
            allTranslations.push(`${translation.language}:${translation.translation}`);
          });
        });
      });
      
      // Extract video URLs from all senses
      const videoUrls = [];
      wordData.senses?.forEach(sense => {
        sense.videos?.forEach(video => {
          if (video.url) videoUrls.push(video.url);
        });
      });
      
      // Extract related words
      const relatedWords = wordData.relatedWords?.map(rel => rel.wordId) || [];

      // Create the document with required fields
      const document: any = {
        id: word.id,
        word: wordData.word,
        createdAt: word.createdAt,
        status: word.status || 'PUBLISHED',
        isNative: wordData.isNative || false,
        senseDefinitions: definitionsByPriority.length > 0 ? definitionsByPriority : [''],
        senseExamples: senseExamples.length > 0 ? senseExamples : [''],
        translations: allTranslations.length > 0 ? allTranslations : [''],
        relatedWords: relatedWords,
        videoUrls: videoUrls
      };
      
      // Add lexical category if it exists in the wordData
      if ((wordData as any).lexicalCategory) {
        document.lexicalCategory = (wordData as any).lexicalCategory;
      }

      await typesense
        .collections('words')
        .documents()
        .upsert(document);

      console.log(`Successfully synced word ${wordData.word} to Typesense.`);
    } catch (error) {
      console.error('Error syncing word to Typesense:', error.message);
    }
  }

  // Helper to find a word by ID
  private async findWordById(wordId: string): Promise<WordEntry | null> {
    try {
      const objectId = this.mongodb.toObjectId(wordId);
      const word = await this.mongodb.words.findOne({ _id: objectId });
      
      if (!word) {
        return null;
      }
      
      return this.mongodb.formatDocument<WordEntry>(word);
    } catch (error) {
      console.error(`Error finding word with ID ${wordId}:`, error);
      return null;
    }
  }
}
