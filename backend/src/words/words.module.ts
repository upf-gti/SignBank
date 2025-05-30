import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';

@Module({
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService]
})
export class WordsModule {}
