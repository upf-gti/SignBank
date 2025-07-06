import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Typesense from 'typesense';
import { VIDEOS_COLLECTION_NAME, videosSchema } from './typesense.config';
import { VideoIndex } from './types/video-index.type';
import { Hand, HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType, MovementDirection, GlossStatus, SignVideo, GlossData, VideoData } from '@prisma/client';

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

  async deleteDocumentsByGlossId(glossId: string) {
    try {
      // Search for all documents with the specific glossId
      const searchResults = await this.client.collections(VIDEOS_COLLECTION_NAME).documents().search({
        q: '*',
        filter_by: `glossId:=${glossId}`,
        per_page: 250 // Maximum documents per page
      });

      // Delete each document found
      const deletePromises = searchResults.hits.map(hit => 
        this.deleteDocument((hit.document as any).id)
      );

      await Promise.all(deletePromises);
      this.logger.log(`Deleted ${searchResults.hits.length} documents for gloss ${glossId}`);
    } catch (error) {
      this.logger.error(`Failed to delete documents for gloss ${glossId}:`, error.stack);
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
          glossData: true
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

  private async importDocuments(documents: VideoIndex[]) {
    try {
      const results = [];
      // Process documents one by one
      for (const document of documents) {
        try {
          // Use upsert which will create or update the document
          const result = await this.client.collections(VIDEOS_COLLECTION_NAME).documents().upsert(document);
          this.logger.debug(`Successfully upserted document ${document.id}`);
        } catch (error) {
          this.logger.error(`Failed to process document ${document.id}:`, {
            error: error.message,
            document: JSON.stringify(document, null, 2)
          });
          results.push({ success: false, error: error.message });
        }
      }      
      return results;
    } catch (error) {
      this.logger.error('Import error:', {
        message: error.message,
        stack: error.stack,
        details: error.importResults ? JSON.stringify(error.importResults, null, 2) : 'No import results available'
      });
      throw error;
    }
  }

  createVideoDocument(
    signVideo: {
      id: string;
      title: string;
      videos: { url: string }[];
      videoData: VideoData;
    },
    glossData: GlossData
  ): VideoIndex {
    const document: VideoIndex = {
      id: signVideo.id,
      url: signVideo.videos[0]?.url || '',
      signVideoTitle: signVideo.title || '',
      hands: signVideo.videoData?.hands || Hand.RIGHT,
      configuration: signVideo.videoData?.configuration || '',
      configurationChanges: signVideo.videoData?.configurationChanges || '',
      relationBetweenArticulators: signVideo.videoData?.relationBetweenArticulators || '',
      location: signVideo.videoData?.location || '',
      movementRelatedOrientation: signVideo.videoData?.movementRelatedOrientation || '',
      orientationRelatedToLocation: signVideo.videoData?.orientationRelatedToLocation || '',
      orientationChange: signVideo.videoData?.orientationChange || '',
      contactType: signVideo.videoData?.contactType || '',
      movementType: signVideo.videoData?.movementType || '',
      movementDirection: signVideo.videoData?.movementDirection || '',
      vocalization: signVideo.videoData?.vocalization || '',
      nonManualComponent: signVideo.videoData?.nonManualComponent || '',
      inicialization: signVideo.videoData?.inicialization || '',
      repeatedMovement: signVideo.videoData?.repeatedMovement || false,
      glossId: glossData.id,
      gloss: glossData.gloss || ''  
    };

    // Log the document for debugging
    this.logger.debug('Created document:', JSON.stringify(document, null, 2));

    return document;
  }

  async updateTypesense(lastSyncTime: Date) {
    this.logger.log('Starting incremental Typesense update...');
    try {
      const updatedEntries = await this.prisma.dictionaryEntry.findMany({
        where: {
          updatedAt: {
            gt: lastSyncTime
          }
        },
        include: {
          glossData: {
            include: {
              senses: true,
              glossVideos: {
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
      });

      let totalDocuments = 0;
      const BATCH_SIZE = 100;
      const documents: VideoIndex[] = [];

      for (const entry of updatedEntries) {
        const glossData = entry.glossData;
        
          if (glossData.glossVideos.length > 0) {
            const highestPrioritySignVideo = glossData.glossVideos.sort((a, b) => a.priority - b.priority)[0];
            const document = this.createVideoDocument(highestPrioritySignVideo, glossData);
            documents.push(document);
            totalDocuments++;

            if (documents.length >= BATCH_SIZE) {
              await this.importDocuments(documents);
              documents.length = 0;
            }
          }
      }

      if (documents.length > 0) {
        await this.importDocuments(documents);
      }

      this.logger.log(`Incremental update completed: ${totalDocuments} documents processed`);
      return { success: true, count: totalDocuments };
    } catch (error) {
      this.logger.error('Error updating Typesense:', error);
      throw error;
    }
  }

  async syncAllVideos() {
    this.logger.log('Starting video sync...');
    try {
      const dictionaryEntries = await this.prisma.dictionaryEntry.findMany({
        where: {
          status: GlossStatus.PUBLISHED
        },
        include: {
          glossData: {
            include: {
              senses: {
                include: {
                  glossData: true,
                  
                }
              },
              glossVideos: {
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
      });

      let totalDocuments = 0;
      const BATCH_SIZE = 100;
      const documents: VideoIndex[] = [];

      for (const entry of dictionaryEntries) {
        const glossData = entry.glossData;
        if (glossData.glossVideos.length > 0) {
          const highestPrioritySignVideo = glossData.glossVideos.sort((a, b) => a.priority - b.priority)[0];
          const document = this.createVideoDocument(highestPrioritySignVideo, glossData);
          documents.push(document);
          totalDocuments++;

          if (documents.length >= BATCH_SIZE) {
            await this.importDocuments(documents);
            documents.length = 0;
          }
        }
      }

      if (documents.length > 0) {
        await this.importDocuments(documents);
      }

      this.logger.log(`Sync completed: ${totalDocuments} documents processed`);
      return { success: true, count: totalDocuments };
    } catch (error) {
      this.logger.error('Error syncing to Typesense:', error);
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
    sort_by?: string;
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
        'movementDirection',
        'hands',
        'repeatedMovement'
      ];
      
      const defaultParams = {
        q: searchParameters.q || '*',
        query_by: searchParameters.query_by || 'gloss,signVideoTitle,configuration,location,hands,configurationChanges,relationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType,movementDirection',
        filter_by: searchParameters.filter_by || '',
        facet_by: searchParameters.facet_by || 'configuration,location,hands,configurationChanges,relationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType,movementDirection,repeatedMovement',
        max_hits: searchParameters.max_hits || 100,
        page: searchParameters.page || 1,
        per_page: searchParameters.per_page || 20,
        sort_by: searchParameters.sort_by || 'gloss:asc',
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