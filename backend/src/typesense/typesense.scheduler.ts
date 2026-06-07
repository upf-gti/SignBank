import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TypesenseService } from './typesense.service';

@Injectable()
export class TypesenseScheduler {
  private readonly logger = new Logger(TypesenseScheduler.name);

  constructor(private readonly typesenseService: TypesenseService) {}

  /** Nightly reconcile — upserts changed glosses without deleting the collection. */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNightlyReconcile() {
    this.logger.log('Starting nightly Typesense reconcile...');
    try {
      await this.typesenseService.ensureCollectionExists();
      const result = await this.typesenseService.syncAllVideos();
      this.logger.log(`Nightly reconcile completed: ${result.count} documents processed`);
    } catch (error) {
      this.logger.error('Nightly Typesense reconcile failed:', error);
    }
  }
}
