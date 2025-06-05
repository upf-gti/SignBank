import { Module } from '@nestjs/common';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossDataModule } from '../gloss-data/gloss-data.module';

@Module({
  imports: [PrismaModule, GlossDataModule],
  controllers: [TranslationsController],
  providers: [TranslationsService],
  exports: [TranslationsService]
})
export class TranslationsModule {} 