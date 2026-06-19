import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Typesense from 'typesense';
import { VIDEOS_COLLECTION_NAME, videosSchema } from './typesense.config';
import { GlossIndex } from './types/gloss-index.type';
import {
  GlossStatus,
  Handedness,
  Prisma,
} from '@prisma/client';

const glossIndexInclude = {
  definitions: {
    include: {
      definitionTranslations: true,
    },
    orderBy: { priority: 'asc' as const },
  },
  glossTranslations: true,
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
    const primaryDefinition = glossData.definitions[0];

    let description = '';
    if (primaryDefinition) {
      description = primaryDefinition.definition;
    }

    const videoData = primarySignVideo.videoData;
    const lexicalCategories = [
      ...new Set(
        glossData.definitions
          .map((definition) => definition.lexicalCategory)
          .filter((category): category is NonNullable<typeof category> => Boolean(category)),
      ),
    ];

    return {
      id: glossData.id,
      glossId: glossData.id,
      gloss: glossData.gloss,
      url: primaryVideo?.url ?? '',
      signVideoTitle: primarySignVideo.title,
      lexicalCategory: primaryDefinition?.lexicalCategory ?? lexicalCategories[0] ?? '',
      lexicalCategories,
      description,
      handedness: videoData?.handedness ?? Handedness.ONE,
      dominantConfiguration: videoData?.dominantConfiguration ?? '',
      nonDominantConfiguration: videoData?.nonDominantConfiguration ?? '',
      dominantRelationBetweenArticulators: videoData?.dominantRelationBetweenArticulators ?? '',
      nonDominantRelationBetweenArticulators: videoData?.nonDominantRelationBetweenArticulators ?? '',
      configurationChanges: videoData?.configurationChanges ?? '',
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

  private getMissingSchemaFields(fields: { name: string }[]): string[] {
    const actualFieldNames = new Set(fields.map((field) => field.name));
    return videosSchema.fields
      .map((field) => field.name)
      .filter((name) => name !== 'id' && !actualFieldNames.has(name));
  }

  async ensureCollectionExists() {
    try {
      const collection = await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .retrieve();
      const missingFields = this.getMissingSchemaFields(collection.fields);

      if (missingFields.length === 0) {
        return {
          success: true,
          created: false,
          message: 'Collection already exists',
        };
      }

      this.logger.warn(
        `Typesense schema out of date (missing: ${missingFields.join(', ')}). Recreating collection...`,
      );
      await this.recreateCollection();
      return {
        success: true,
        created: true,
        message: 'Collection recreated due to schema changes',
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

  private async listIndexedDocumentIds(): Promise<string[]> {
    const ids: string[] = [];
    const perPage = 250;
    let page = 1;

    while (true) {
      const results = await this.client
        .collections(VIDEOS_COLLECTION_NAME)
        .documents()
        .search({
          q: '*',
          query_by: 'gloss',
          per_page: perPage,
          page,
        });

      const hits = results.hits ?? [];
      for (const hit of hits) {
        ids.push((hit.document as { id: string }).id);
      }

      if (hits.length < perPage) {
        break;
      }
      page++;
    }

    return ids;
  }

  private async removeOrphanedDocuments(validIds: Set<string>) {
    const indexedIds = await this.listIndexedDocumentIds();
    const orphanedIds = indexedIds.filter((id) => !validIds.has(id));

    if (orphanedIds.length === 0) {
      return 0;
    }

    await Promise.all(orphanedIds.map((id) => this.deleteDocument(id)));
    this.logger.log(`Removed ${orphanedIds.length} stale documents from search index`);
    return orphanedIds.length;
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

      const validIds = new Set(documents.map((document) => document.id));
      await this.removeOrphanedDocuments(validIds);

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
          'gloss,signVideoTitle,description,dominantConfiguration,nonDominantConfiguration,location,handedness,configurationChanges,dominantRelationBetweenArticulators,nonDominantRelationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType,movementDirection',
        filter_by: searchParameters.filter_by || '',
        facet_by:
          searchParameters.facet_by ||
          'lexicalCategory,dominantConfiguration,nonDominantConfiguration,location,handedness,configurationChanges,dominantRelationBetweenArticulators,nonDominantRelationBetweenArticulators,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType,movementDirection,repeatedMovement,description,gloss,signVideoTitle',
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
