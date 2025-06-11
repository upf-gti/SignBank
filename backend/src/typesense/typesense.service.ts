import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Typesense from 'typesense';
import { VIDEOS_COLLECTION_NAME, videosSchema } from './typesense.config';
import { VideoIndex } from './types/video-index.type';

@Injectable()
export class TypesenseService implements OnModuleInit {
  private client: Typesense.Client;
  private readonly logger = new Logger(TypesenseService.name);

  constructor(private prisma: PrismaService) {
    this.client = new Typesense.Client({
      nodes: [{
        host: process.env.TYPESENSE_HOST || 'typesense',
        port: parseInt(process.env.TYPESENSE_PORT || '8108'),
        protocol: 'http'
      }],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
      connectionTimeoutSeconds: 2
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing Typesense service...');      

      // First, initialize the collection
      await this.initializeCollection();
      
      // Then sync all videos
      await this.syncAllVideos();
      this.logger.log('Initial sync completed');
    } catch (error) {
      this.logger.error('Error during Typesense initialization:', error.stack);
      throw error;
    }
  }

  async deleteDocument(documentId: string) {
    try {
      await this.client.collections(VIDEOS_COLLECTION_NAME).documents(documentId).delete();
    } catch (error) {
      this.logger.error(`Failed to delete document ${documentId}:`, error.stack);
      throw error;
    }
  }

  async upsertDocument(document: VideoIndex) {
    try {
      await this.client.collections(VIDEOS_COLLECTION_NAME).documents().upsert(document);
    } catch (error) {
      this.logger.error(`Failed to upsert document ${document.id}:`, error.stack);
      throw error;
    }
  }

  async findSignVideo(signVideoId: string) {
    try {
      return await this.prisma.signVideo.findUnique({
        where: { id: signVideoId },
        include: {
          videos: true,
          videoData: true,
          sense: {
            include: {
              glossData: true
            }
          }
        }
      });
    } catch (error) {
      this.logger.error(`Failed to find SignVideo ${signVideoId}:`, error.stack);
      throw error;
    }
  }

  async initializeCollection() {
    try {
      try {
        await this.client.collections(VIDEOS_COLLECTION_NAME).delete();
      } catch (error) {
        // Collection didn't exist, continue
      }

      await this.client.collections().create(videosSchema);
      return { success: true, message: 'Collection initialized successfully' };
    } catch (error) {
      this.logger.error('Error initializing Typesense collection:', error.stack);
      throw error;
    }
  }

  async getCollectionStatus() {
    try {
      const collection = await this.client.collections(VIDEOS_COLLECTION_NAME).retrieve();
      const stats = await this.client.collections(VIDEOS_COLLECTION_NAME).documents().search({ 
        q: '*',
        filter_by: '' // Empty string means no filtering
      });
      
      return {
        name: collection.name,
        numberOfDocuments: collection.num_documents,
        numberOfFields: collection.fields.length,
        fields: collection.fields,
        lastUpdated: collection.created_at,
        totalHits: stats.found
      };
    } catch (error) {
      this.logger.error('Error getting collection status:', error.stack);
      throw error;
    }
  }

  async syncAllVideos() {
    this.logger.log('Starting video sync...');
    try {
      const dictionaryEntries = await this.prisma.dictionaryEntry.findMany({
        include: {
          glossData: {
            include: {
              senses: {
                include: {
                  glossData: true,
                  signVideos: {
                    include: {
                      videos: true,
                      videoData: true
                    },
                    orderBy: {
                      priority: 'desc'
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      const senses = dictionaryEntries.flatMap(entry => entry.glossData.senses);

      let totalDocuments = 0;
      const BATCH_SIZE = 100;
      const documents: VideoIndex[] = [];

      for (const sense of senses) {
        
          const highestPrioritySignVideo = sense.signVideos[0];
          
          const document: VideoIndex = {
            id: highestPrioritySignVideo.id,
            url: highestPrioritySignVideo.videos[0]?.url || null,
            signVideoTitle: highestPrioritySignVideo.title,
            hands: highestPrioritySignVideo.videoData?.hands || 'RIGHT',
            configuration: highestPrioritySignVideo.videoData?.configuration || '',
            configurationChanges: highestPrioritySignVideo.videoData?.configurationChanges || '',
            relationBetweenArticulators: highestPrioritySignVideo.videoData?.relationBetweenArticulators || '',
            location: highestPrioritySignVideo.videoData?.location || '',
            movementRelatedOrientation: highestPrioritySignVideo.videoData?.movementRelatedOrientation || '',
            orientationRelatedToLocation: highestPrioritySignVideo.videoData?.orientationRelatedToLocation || '',
            orientationChange: highestPrioritySignVideo.videoData?.orientationChange || '',
            contactType: highestPrioritySignVideo.videoData?.contactType || '',
            movementType: highestPrioritySignVideo.videoData?.movementType || '',
            vocalization: highestPrioritySignVideo.videoData?.vocalization || '',
            nonManualComponent: highestPrioritySignVideo.videoData?.nonManualComponent || '',
            inicialization: highestPrioritySignVideo.videoData?.inicialization || '',
            senseId: sense.id,
            senseTitle: sense.senseTitle,
            lexicalCategory: sense.lexicalCategory || 'OTHER',
            glossId: sense.glossData.id,
            gloss: sense.glossData.gloss
          };

          documents.push(document);
          totalDocuments++;

        if (documents.length >= BATCH_SIZE) {
          await this.client.collections(VIDEOS_COLLECTION_NAME).documents().import(documents);
          documents.length = 0;
        }
      }

      if (documents.length > 0) {
        await this.client.collections(VIDEOS_COLLECTION_NAME).documents().import(documents);
      }

      this.logger.log(`Sync completed: ${totalDocuments} documents processed`);
      return { success: true, count: totalDocuments };
    } catch (error) {
      this.logger.error('Error syncing to Typesense:', error.stack);
      throw error;
    }
  }

  async search(searchParameters: {
    q?: string;
    query_by?: string;
    filter_by?: string;
    facet_by?: string;
    max_hits?: number;
    page?: number;
    per_page?: number;
  }) {
    try {
      const phonologyFields = [
        'configuration',
        'configurationChanges', 
        'relationBetweenArticulators',
        'location',
        'movementRelatedOrientation',
        'orientationRelatedToLocation',
        'orientationChange',
        'contactType',
        'movementType',
        'hands'
      ];
      
      const defaultParams = {
        q: searchParameters.q || '*',
        query_by: searchParameters.query_by || 'gloss,senseTitle,signVideoTitle,configuration,location,hands,configurationChanges,relationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType',
        filter_by: searchParameters.filter_by || '',
        facet_by: searchParameters.facet_by || 'configuration,location,hands,lexicalCategory,configurationChanges,relationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType',
        max_hits: searchParameters.max_hits || 100,
        page: searchParameters.page || 1,
        per_page: searchParameters.per_page || 20,
        // Add typo tolerance for phonology fields - allows 2 typos for better matching
        typo_tolerance_threshold: 0,
        // Allow prefix matching for better partial matches
        prefix: true,
      };

      return await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents()
        .search(defaultParams as any);
    } catch (error) {
      this.logger.error('Error searching in Typesense:', error.stack);
      throw error;
    }
  }
} 