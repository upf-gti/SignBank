import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TypesenseService } from './typesense.service';

@Injectable()
export class TypesenseScheduler {
  private readonly logger = new Logger(TypesenseScheduler.name);
  private lastSyncTime: Date = new Date(0); // Initialize to epoch time

  constructor(private readonly typesenseService: TypesenseService) {}

  // Run every 10 seconds
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleDailySync() {
    this.logger.log('Starting periodic Typesense sync...');
    try {
      const result = await this.typesenseService.updateTypesense(this.lastSyncTime);
      if (result.success) {
        this.lastSyncTime = new Date(); // Update last sync time
        this.logger.log('Periodic sync completed successfully:', result);
      } else {
        this.logger.log('Periodic sync skipped: No new documents to sync');
      }
    } catch (error) {
      this.logger.error('Periodic sync failed:', error);
    }
  }

  // Run at midnight every day
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMidnightFullSync() {
    this.logger.log('Starting midnight full Typesense sync...');
    try {      
      await this.typesenseService.initializeCollection();
      const result = await this.typesenseService.syncAllVideos();
      if (result.success) {
        this.lastSyncTime = new Date(); // Reset last sync time
        this.logger.log('Midnight full sync completed successfully:', result);
      } else {
        this.logger.error('Midnight full sync failed:', result);
      }
    } catch (error) {
      this.logger.error('Midnight full sync failed:', error);
    }
  }
} 