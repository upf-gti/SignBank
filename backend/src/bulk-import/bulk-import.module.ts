import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TypesenseModule } from '../typesense/typesense.module';
import { BulkImportController } from './bulk-import.controller';
import { BulkImportService } from './bulk-import.service';

@Module({
  imports: [PrismaModule, TypesenseModule],
  controllers: [BulkImportController],
  providers: [BulkImportService],
})
export class BulkImportModule {}
