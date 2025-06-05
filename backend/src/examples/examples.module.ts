import { Module } from '@nestjs/common';
import { ExamplesController } from './examples.controller';
import { ExamplesService } from './examples.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossDataModule } from '../gloss-data/gloss-data.module';

@Module({
  imports: [PrismaModule, GlossDataModule],
  controllers: [ExamplesController],
  providers: [ExamplesService],
  exports: [ExamplesService]
})
export class ExamplesModule {} 