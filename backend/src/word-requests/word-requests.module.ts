// word-requests/word-requests.module.ts
import { Module } from '@nestjs/common';
import { WordRequestsController } from './word-requests.controller';
import { WordRequestsService } from './word-requests.service';
import { TypesenseSyncService } from 'src/typesense/sync';
import { MongoDBModule } from 'src/mongodb/mongodb.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongoDBModule, 
    AuthModule,
  ],
  controllers: [WordRequestsController],
  providers: [WordRequestsService, TypesenseSyncService],
  exports: [WordRequestsService]
})
export class WordRequestsModule {}