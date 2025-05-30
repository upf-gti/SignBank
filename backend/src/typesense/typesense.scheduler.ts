import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TypesenseService } from './typesense.service';

@Injectable()
export class TypesenseScheduler {
  constructor(private readonly typesenseService: TypesenseService) {}

  // Run every day at 3 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailySync() {
    console.log('Starting daily Typesense sync...');
    try {
      const result = await this.typesenseService.syncVideos();
      console.log('Daily sync completed:', result);
    } catch (error) {
      console.error('Daily sync failed:', error);
    }
  }
} 