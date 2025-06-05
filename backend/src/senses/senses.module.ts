import { Module } from '@nestjs/common';
import { SensesController } from './senses.controller';
import { SensesService } from './senses.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossDataModule } from '../gloss-data/gloss-data.module';

@Module({
  imports: [PrismaModule, GlossDataModule],
  controllers: [SensesController],
  providers: [SensesService],
  exports: [SensesService]
})
export class SensesModule {} 