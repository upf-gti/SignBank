import { Module } from '@nestjs/common';
import { GlossesController } from './glosses.controller';
import { GlossesService } from './glosses.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlossRequestsModule } from '../gloss-requests/gloss-requests.module';

@Module({
  imports: [PrismaModule, GlossRequestsModule],
  controllers: [GlossesController],
  providers: [GlossesService],
  exports: [GlossesService],
})
export class GlossesModule {} 