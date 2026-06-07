import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TypesenseService } from './typesense.service';
import {
  GLOSS_SEARCH_SYNC_EVENT,
  GlossSearchSyncPayload,
} from './types/gloss-index.type';

@Injectable()
export class TypesenseSubscriber {
  private readonly logger = new Logger(TypesenseSubscriber.name);

  constructor(private readonly typesenseService: TypesenseService) {}

  @OnEvent(GLOSS_SEARCH_SYNC_EVENT)
  async handleGlossSearchSync(payload: GlossSearchSyncPayload) {
    try {
      const result = await this.typesenseService.syncPublishedGloss(
        payload.glossDataId,
      );
      this.logger.debug(
        `Search index ${result.action} for gloss ${payload.glossDataId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync gloss ${payload.glossDataId} to Typesense:`,
        error,
      );
    }
  }
}
