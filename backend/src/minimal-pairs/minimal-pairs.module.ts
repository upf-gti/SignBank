import { Module } from '@nestjs/common';
import { MinimalPairsController } from './minimal-pairs.controller';
import { MinimalPairsService } from './minimal-pairs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossDataModule } from '../gloss-data/gloss-data.module';

@Module({
  imports: [PrismaModule, GlossDataModule],
  controllers: [MinimalPairsController],
  providers: [MinimalPairsService],
  exports: [MinimalPairsService]
})
export class MinimalPairsModule {} 