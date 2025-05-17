import { Module } from '@nestjs/common';
import { GlossesController } from './glosses.controller';
import { GlossesService } from './glosses.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GlossesController],
  providers: [GlossesService, PrismaService],
  exports: [GlossesService],
})
export class GlossesModule {} 