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
    this.logger.log(`Typesense client configured with host: ${process.env.TYPESENSE_HOST || 'localhost'}`);
  }

  async onModuleInit() {
    try {
      this.logger.log('🚀 Initializing Typesense service...');
      let needsSync = true;
      debugger;
      try {
        const status = await this.getCollectionStatus();
        this.logger.log(`Collection "${VIDEOS_COLLECTION_NAME}" exists with ${status.numberOfDocuments} documents`);
        
        if (status.numberOfDocuments === 0) {
          this.logger.warn('Collection exists but is empty, will perform initial sync');
          needsSync = true;
        }
      } catch (error) {
        this.logger.warn('Collection does not exist, creating and will perform initial sync');
        await this.initializeCollection();
        needsSync = true;
      }

      if (needsSync) {
        this.logger.log('Starting initial data sync...');
        await this.syncVideos();
        this.logger.log('✅ Initial sync completed successfully');
      } else {
        this.logger.log('✅ Collection exists and has data, skipping initial sync');
      }
    } catch (error) {
      this.logger.error('❌ Error during Typesense initialization:', error.stack);
      throw error;
    }
  }

  // Public methods for the subscriber
  async deleteDocument(documentId: string) {
    this.logger.debug(`Deleting document with ID: ${documentId}`);
    try {
      await this.client.collections(VIDEOS_COLLECTION_NAME).documents(documentId).delete();
      this.logger.debug(`Successfully deleted document ${documentId}`);
    } catch (error) {
      this.logger.error(`Failed to delete document ${documentId}:`, error.stack);
      throw error;
    }
  }

  async upsertDocument(document: VideoIndex) {
    this.logger.debug(`Upserting document for video: ${document.id}`);
    try {
      await this.client.collections(VIDEOS_COLLECTION_NAME).documents().upsert(document);
      this.logger.debug(`Successfully upserted document ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to upsert document ${document.id}:`, error.stack);
      throw error;
    }
  }

  async findSignVideo(signVideoId: string) {
    this.logger.debug(`Finding SignVideo with ID: ${signVideoId}`);
    try {
      const signVideo = await this.prisma.signVideo.findUnique({
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
      this.logger.debug(
        signVideo 
          ? `Found SignVideo ${signVideoId} with ${signVideo.videos.length} videos` 
          : `SignVideo ${signVideoId} not found`
      );
      return signVideo;
    } catch (error) {
      this.logger.error(`Failed to find SignVideo ${signVideoId}:`, error.stack);
      throw error;
    }
  }

  async initializeCollection() {
    this.logger.log('Initializing Typesense collection...');
    try {
      // Delete if exists
      try {
        this.logger.debug('Attempting to delete existing collection...');
        await this.client.collections(VIDEOS_COLLECTION_NAME).delete();
        this.logger.debug('Successfully deleted existing collection');
      } catch (error) {
        this.logger.debug('Collection did not exist, proceeding with creation');
      }

      // Create collection
      this.logger.debug(`Creating collection with schema: ${JSON.stringify(videosSchema, null, 2)}`);
      await this.client.collections().create(videosSchema);
      this.logger.log('✅ Collection initialized successfully');
      
      return {
        success: true,
        message: 'Collection initialized successfully'
      };
    } catch (error) {
      this.logger.error('❌ Error initializing Typesense collection:', error.stack);
      throw error;
    }
  }

  async getCollectionStatus() {
    this.logger.debug('Fetching collection status...');
    try {
      const collection = await this.client.collections(VIDEOS_COLLECTION_NAME).retrieve();
      const stats = await this.client.collections(VIDEOS_COLLECTION_NAME).documents().search({ q: '*' });
      
      const status = {
        name: collection.name,
        numberOfDocuments: collection.num_documents,
        numberOfFields: collection.fields.length,
        fields: collection.fields,
        lastUpdated: collection.created_at,
        totalHits: stats.found
      };

      this.logger.debug(`Collection status: ${JSON.stringify(status, null, 2)}`);
      return status;
    } catch (error) {
      this.logger.error('Error getting collection status:', error.stack);
      throw error;
    }
  }

  async syncVideos() {
    this.logger.log('🔄 Starting video sync process...');
    try {
      // Get all Senses with their relationships
      this.logger.debug('Fetching all Senses from database...');
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
      this.logger.log(`Found ${senses.length} Senses to process`);

      let totalDocuments = 0;
      const BATCH_SIZE = 100;
      const documents: VideoIndex[] = [];

      // Process each Sense
      for (const sense of senses) {
        this.logger.debug(`Processing Sense: ${sense.id}`);
        
        if (sense.signVideos.length === 0) {
          // If sense has no videos, create a single document with just sense info
          documents.push({
            id: `sense-${sense.id}`, // Special ID for senses without videos
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
          // For senses with videos, process each SignVideo and its videos
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

        // If we've reached the batch size, import the batch
        if (documents.length >= BATCH_SIZE) {
          this.logger.debug(`Importing batch of ${documents.length} documents...`);
          await this.client.collections(VIDEOS_COLLECTION_NAME).documents().import(documents);
          documents.length = 0; // Clear the array
          this.logger.log(`Progress: ${totalDocuments}/${senses.length} senses processed`);
        }
      }

      // Import any remaining documents
      if (documents.length > 0) {
        this.logger.debug(`Importing final batch of ${documents.length} documents...`);
        await this.client.collections(VIDEOS_COLLECTION_NAME).documents().import(documents);
      }

      this.logger.log(`✅ Sync completed successfully! Processed ${totalDocuments} documents from ${senses.length} senses`);
      return {
        success: true,
        count: totalDocuments,
        message: `Successfully synced ${totalDocuments} documents to Typesense`
      };
    } catch (error) {
      this.logger.error('❌ Error syncing to Typesense:', error.stack);
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
    this.logger.debug(`Performing search with parameters: ${JSON.stringify(searchParameters, null, 2)}`);
    try {
      const defaultParams = {
        q: searchParameters.q || '*',
        query_by: searchParameters.query_by || 'gloss,senseTitle,configuration,location,hands',
        filter_by: searchParameters.filter_by,
        facet_by: searchParameters.facet_by,
        max_hits: searchParameters.max_hits || 100,
        page: searchParameters.page || 1,
        per_page: searchParameters.per_page || 20
      };

      const results = await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents()
        .search(defaultParams);

      this.logger.debug(`Search completed. Found ${results.found} results`);
      return results;
    } catch (error) {
      this.logger.error('Error searching in Typesense:', error.stack);
      throw error;
    }
  }
} 