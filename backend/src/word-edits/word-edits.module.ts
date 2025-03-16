import { Module } from '@nestjs/common';
import { WordEditsController } from './word-edits.controller';
import { WordEditsService } from './word-edits.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TypesenseSyncService } from 'src/typesense/sync';

@Module({
  imports: [PrismaModule],
  controllers: [WordEditsController],
  providers: [WordEditsService, TypesenseSyncService],
  exports: [WordEditsService]
})
export class WordEditsModule {} 