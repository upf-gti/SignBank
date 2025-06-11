import { Module } from '@nestjs/common';
import { ExampleTranslationsController } from './example-translations.controller';
import { ExampleTranslationsService } from './example-translations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossDataModule } from '../gloss-data/gloss-data.module';

@Module({
  imports: [PrismaModule, GlossDataModule],
  controllers: [ExampleTranslationsController],
  providers: [ExampleTranslationsService],
  exports: [ExampleTranslationsService]
})
export class ExampleTranslationsModule {} 