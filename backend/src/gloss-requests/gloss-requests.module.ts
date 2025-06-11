import { Module } from '@nestjs/common';
import { GlossRequestsController } from './gloss-requests.controller';
import { GlossRequestsService } from './gloss-requests.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlossRequestsController],
  providers: [GlossRequestsService],
  exports: [GlossRequestsService],
})
export class GlossRequestsModule {} 