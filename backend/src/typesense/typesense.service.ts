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
        host: process.env.TYPESENSE_HOST || 'localhost',
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
      const senses = await this.prisma.sense.findMany({
        include: {
          glossData: true,
          signVideos: {
            include: {
              videos: true,
              videoData: true
            }
          }
        }
      });

      let totalDocuments = 0;
      const BATCH_SIZE = 100;
      const documents: VideoIndex[] = [];

      for (const sense of senses) {
        if (sense.signVideos.length === 0) {
          documents.push({
            id: `sense-${sense.id}`,
            url: null,
            signVideoTitle: null,
            hands: null,
            configuration: null,
            configurationChanges: null,
            relationBetweenArticulators: null,
            location: null,
            movementRelatedOrientation: null,
            locationRelatedOrientation: null,
            orientationChange: null,
            contactType: null,
            movementType: null,
            vocalization: null,
            nonManualComponent: null,
            inicialization: null,
            senseId: sense.id,
            senseTitle: sense.senseTitle,
            lexicalCategory: sense.lexicalCategory || 'OTHER',
            glossId: sense.glossData.id,
            gloss: sense.glossData.gloss
          });
          totalDocuments++;
        } else {
          for (const signVideo of sense.signVideos) {
            for (const video of signVideo.videos) {
              documents.push({
                id: video.id,
                url: video.url,
                signVideoTitle: signVideo.title,
                hands: signVideo.videoData?.hands,
                configuration: signVideo.videoData?.configuration,
                configurationChanges: signVideo.videoData?.configurationChanges,
                relationBetweenArticulators: signVideo.videoData?.relationBetweenArticulators,
                location: signVideo.videoData?.location,
                movementRelatedOrientation: signVideo.videoData?.movementRelatedOrientation,
                locationRelatedOrientation: signVideo.videoData?.locationRelatedOrientation,
                orientationChange: signVideo.videoData?.orientationChange,
                contactType: signVideo.videoData?.contactType,
                movementType: signVideo.videoData?.movementType,
                vocalization: signVideo.videoData?.vocalization,
                nonManualComponent: signVideo.videoData?.nonManualComponent,
                inicialization: signVideo.videoData?.inicialization,
                senseId: sense.id,
                senseTitle: sense.senseTitle,
                lexicalCategory: sense.lexicalCategory || 'OTHER',
                glossId: sense.glossData.id,
                gloss: sense.glossData.gloss
              });
              totalDocuments++;
            }
          }
        }

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
      const defaultParams = {
        q: searchParameters.q || '*',
        query_by: searchParameters.query_by || 'gloss,senseTitle,configuration,location,hands',
        filter_by: searchParameters.filter_by || '', // Add default empty string
        facet_by: searchParameters.facet_by,
        max_hits: searchParameters.max_hits || 100,
        page: searchParameters.page || 1,
        per_page: searchParameters.per_page || 20
      };

      return await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents()
        .search(defaultParams);
    } catch (error) {
      this.logger.error('Error searching in Typesense:', error.stack);
      throw error;
    }
  }
} 