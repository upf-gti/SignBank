// word-requests/word-requests.module.ts
import { Module } from '@nestjs/common';
import { WordRequestsController } from './word-requests.controller';
import { WordRequestsService } from './word-requests.service';
import { TypesenseSyncService } from 'src/typesense/sync';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WordRequestsController],
  providers: [WordRequestsService, TypesenseSyncService],
  exports: [WordRequestsService]
})
export class WordRequestsModule {}