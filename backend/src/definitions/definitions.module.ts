import { Module } from '@nestjs/common';
import { DefinitionsController } from './definitions.controller';
import { DefinitionsService } from './definitions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossDataModule } from '../gloss-data/gloss-data.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [PrismaModule, GlossDataModule, VideosModule],
  controllers: [DefinitionsController],
  providers: [DefinitionsService],
  exports: [DefinitionsService]
})
export class DefinitionsModule {} 