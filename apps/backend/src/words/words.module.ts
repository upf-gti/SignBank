import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';

@Module({})
export class WordsModule {
    controllers = [WordsController];
    providers = [WordsService];
}
