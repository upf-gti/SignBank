import { Module } from '@nestjs/common';
import { GlossDataController } from './gloss-data.controller';
import { GlossDataService } from './gloss-data.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TypesenseModule } from '../typesense/typesense.module';

@Module({
  imports: [PrismaModule, TypesenseModule],
  controllers: [GlossDataController],
  providers: [GlossDataService],
  exports: [GlossDataService],
})
export class GlossDataModule {} 