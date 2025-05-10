import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypesenseSyncService } from './typesense/sync';
import { WordsModule } from './words/words.module';
import { WordRequestsModule } from './word-requests/word-requests.module'
import { MongoDBModule } from './mongodb/mongodb.module';
import { VideosModule } from './videos/videos.module';
// import { WordEditsModule } from './word-edits/word-edits.module';

@Module({
  imports: [
    MongoDBModule,
    AuthModule, 
    WordsModule, 
    // PrismaModule, 
    WordRequestsModule,
    VideosModule,
    // WordEditsModule
  ],
  controllers: [AppController],
  providers: [AppService, TypesenseSyncService],
})
export class AppModule {}
