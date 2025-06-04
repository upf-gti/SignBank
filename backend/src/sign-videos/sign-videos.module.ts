import { Module } from '@nestjs/common';
import { SignVideosController } from './sign-videos.controller';
import { SignVideosService } from './sign-videos.service';
import { GlossDataModule } from '../gloss-data/gloss-data.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, GlossDataModule],
  controllers: [SignVideosController],
  providers: [SignVideosService],
  exports: [SignVideosService],
})
export class SignVideosModule {} 