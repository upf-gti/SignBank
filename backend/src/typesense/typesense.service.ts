import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Typesense from 'typesense';
import { VIDEOS_COLLECTION_NAME, videosSchema } from './typesense.config';
import { GlossIndex } from './types/gloss-index.type';
import {
  GlossStatus,
  Hand,
  Prisma,
} from '@prisma/client';

const glossIndexInclude = {
  senses: {
    include: {
      definitions: {
        orderBy: { priority: 'asc' as const },
      },
    },
    orderBy: { priority: 'asc' as const },
  },
  glossVideos: {
    include: {
      videos: { orderBy: { priority: 'asc' as const } },
      videoData: true,
    },
    orderBy: { priority: 'asc' as const },
  },
} satisfies Prisma.GlossDataInclude;

type GlossDataForIndex = Prisma.GlossDataGetPayload<{
  include: typeof glossIndexInclude;
}>;

@Injectable()
export class TypesenseService implements OnModuleInit {
  private client: Typesense.Client;
  private readonly logger = new Logger(TypesenseService.name);

  constructor(private prisma: PrismaService) {
    this.client = new Typesense.Client({
      nodes: [{
        host: process.env.TYPESENSE_HOST || 'typesense',
        port: parseInt(process.env.TYPESENSE_PORT || '8108'),
        protocol: 'http',
      }],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
      connectionTimeoutSeconds: 2,
    });
  }

  onModuleInit() {
    this.logger.log('Initializing Typesense service...');
    void this.bootstrapTypesense();
  }

  private async bootstrapTypesense() {
    try {
      await this.ensureCollectionExists();
      const result = await this.syncAllVideos();
      this.logger.log(
        `Initial Typesense sync completed: ${result.count} documents indexed`,
      );
    } catch (error) {
      this.logger.error(
        'Typesense bootstrap failed — app will continue without search index sync',
        error.stack,
      );
    }
  }

  async deleteDocument(documentId: string) {
    try {
      await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents(documentId)
        .delete();
    } catch (error) {
      if (error.httpStatus === 404) {
        return;
      }
      this.logger.error(`Failed to delete document ${documentId}:`, error.stack);
      throw error;
    }
  }

  async deleteDocumentsByGlossId(glossDataId: string) {
    await this.removeGlossFromIndex(glossDataId);
  }

  async removeGlossFromIndex(glossDataId: string) {
    try {
      await this.deleteDocument(glossDataId);

      const searchResults = await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents()
        .search({
          q: '*',
          filter_by: `glossId:=${glossDataId}`,
          per_page: 250,
        });

      await Promise.all(
        searchResults.hits.map((hit) =>
          this.deleteDocument((hit.document as { id: string }).id),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove gloss ${glossDataId} from index:`,
        error.stack,
      );
      throw error;
    }
  }

  async upsertDocument(document: GlossIndex) {
    try {
      await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents()
        .upsert(document);
    } catch (error) {
      this.logger.error(`Failed to upsert document ${document.id}:`, error.stack);
      throw error;
    }
  }

  buildGlossDocument(glossData: GlossDataForIndex): GlossIndex | null {
    if (!glossData.glossVideos.length) {
      return null;
    }

    const primarySignVideo = glossData.glossVideos[0];
    const primaryVideo = primarySignVideo.videos[0];
    const primarySense = glossData.senses[0];

    let description = '';
    if (primarySense?.definitions.length) {
      description = primarySense.definitions[0].definition;
    }

    const videoData = primarySignVideo.videoData;

    return {
      id: glossData.id,
      glossId: glossData.id,
      gloss: glossData.gloss,
      url: primaryVideo?.url ?? '',
      signVideoTitle: primarySignVideo.title,
      senseId: primarySense?.id ?? '',
      senseTitle: primarySense?.senseTitle ?? '',
      lexicalCategory: primarySense?.lexicalCategory ?? '',
      description,
      hands: videoData?.hands ?? Hand.RIGHT,
      configuration: videoData?.configuration ?? '',
      configurationChanges: videoData?.configurationChanges ?? '',
      relationBetweenArticulators: videoData?.relationBetweenArticulators ?? '',
      location: videoData?.location ?? '',
      movementRelatedOrientation: videoData?.movementRelatedOrientation ?? '',
      orientationRelatedToLocation: videoData?.orientationRelatedToLocation ?? '',
      orientationChange: videoData?.orientationChange ?? '',
      contactType: videoData?.contactType ?? '',
      movementType: videoData?.movementType ?? '',
      movementDirection: videoData?.movementDirection ?? '',
      vocalization: videoData?.vocalization ?? '',
      nonManualComponent: videoData?.nonManualComponent ?? '',
      inicialization: videoData?.inicialization ?? '',
      repeatedMovement: videoData?.repeatedMovement ?? false,
    };
  }

  /** @deprecated Use buildGlossDocument */
  createVideoDocument(
    signVideo: GlossDataForIndex['glossVideos'][number],
    glossData: GlossDataForIndex,
  ): GlossIndex | null {
    return this.buildGlossDocument({
      ...glossData,
      glossVideos: [signVideo],
    });
  }

  async syncPublishedGloss(glossDataId: string) {
    const entry = await this.prisma.dictionaryEntry.findUnique({
      where: { glossDataId },
      include: {
        glossData: { include: glossIndexInclude },
      },
    });

    if (!entry || entry.status !== GlossStatus.PUBLISHED) {
      await this.removeGlossFromIndex(glossDataId);
      return { success: true, action: 'removed' as const };
    }

    const document = this.buildGlossDocument(entry.glossData);
    if (!document) {
      await this.removeGlossFromIndex(glossDataId);
      return { success: true, action: 'removed' as const };
    }

    await this.upsertDocument(document);
    return { success: true, action: 'upserted' as const };
  }

  async ensureCollectionExists() {
    try {
      await this.client.collections(VIDEOS_COLLECTION_NAME).retrieve();
      return {
        success: true,
        created: false,
        message: 'Collection already exists',
      };
    } catch (error) {
      if (error.httpStatus !== 404) {
        this.logger.error('Error checking Typesense collection:', error.stack);
        throw error;
      }

      await this.client.collections().create(videosSchema);
      this.logger.log('Typesense collection created');
      return {
        success: true,
        created: true,
        message: 'Collection created successfully',
      };
    }
  }

  async recreateCollection() {
    try {
      try {
        await this.client.collections(VIDEOS_COLLECTION_NAME).delete();
      } catch (error) {
        if (error.httpStatus !== 404) {
          throw error;
        }
      }

      await this.client.collections().create(videosSchema);
      this.logger.warn('Typesense collection recreated (all documents removed)');
      return { success: true, message: 'Collection recreated successfully' };
    } catch (error) {
      this.logger.error('Error recreating Typesense collection:', error.stack);
      throw error;
    }
  }

  async initializeCollection() {
    return this.ensureCollectionExists();
  }

  async getCollectionStatus() {
    try {
      const collection = await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .retrieve();
      const stats = await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents()
        .search({ q: '*', filter_by: '' });

      return {
        name: collection.name,
        numberOfDocuments: collection.num_documents,
        numberOfFields: collection.fields.length,
        fields: collection.fields,
        lastUpdated: collection.created_at,
        totalHits: stats.found,
      };
    } catch (error) {
      this.logger.error('Error getting collection status:', error.stack);
      throw error;
    }
  }

  private async importDocuments(documents: GlossIndex[]) {
    for (const document of documents) {
      try {
        await this.upsertDocument(document);
      } catch (error) {
        this.logger.error(`Failed to process document ${document.id}:`, {
          error: error.message,
          document: JSON.stringify(document, null, 2),
        });
      }
    }
  }

  async syncAllVideos() {
    this.logger.log('Starting gloss search sync...');
    try {
      const dictionaryEntries = await this.prisma.dictionaryEntry.findMany({
        where: { status: GlossStatus.PUBLISHED },
        include: {
          glossData: { include: glossIndexInclude },
        },
      });

      const documents: GlossIndex[] = [];
      for (const entry of dictionaryEntries) {
        const document = this.buildGlossDocument(entry.glossData);
        if (document) {
          documents.push(document);
        }
      }

      const BATCH_SIZE = 100;
      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        await this.importDocuments(documents.slice(i, i + BATCH_SIZE));
      }

      this.logger.log(`Sync completed: ${documents.length} glosses indexed`);
      return { success: true, count: documents.length };
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
      const defaultParams = {
        q: searchParameters.q || '*',
        query_by:
          searchParameters.query_by ||
          'gloss,signVideoTitle,description,configuration,location,hands,configurationChanges,relationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType,movementDirection',
        filter_by: searchParameters.filter_by || '',
        facet_by:
          searchParameters.facet_by ||
          'lexicalCategory,configuration,location,hands,configurationChanges,relationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType,movementDirection,repeatedMovement,description,gloss,signVideoTitle',
        max_hits: searchParameters.max_hits || 100,
        page: searchParameters.page || 1,
        per_page: searchParameters.per_page || 20,
        sort_by: searchParameters.sort_by || 'gloss:asc',
        typo_tolerance_threshold: 0,
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
