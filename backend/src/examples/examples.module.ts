import { Module } from '@nestjs/common';
import { ExamplesController } from './examples.controller';
import { ExamplesService } from './examples.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossDataModule } from '../gloss-data/gloss-data.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [PrismaModule, GlossDataModule, VideosModule],
  controllers: [ExamplesController],
  providers: [ExamplesService],
  exports: [ExamplesService]
})
export class ExamplesModule {} 