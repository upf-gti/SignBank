import { Module } from '@nestjs/common';
import { GlossDataController } from './gloss-data.controller';
import { GlossDataService } from './gloss-data.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PhonologyValuesModule } from '../phonology-values/phonology-values.module';

@Module({
  imports: [PrismaModule, PhonologyValuesModule],
  controllers: [GlossDataController],
  providers: [GlossDataService],
  exports: [GlossDataService],
})
export class GlossDataModule {}
