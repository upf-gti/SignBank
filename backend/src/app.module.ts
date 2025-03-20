import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { TypesenseSyncService } from './typesense/sync';
import { WordsModule } from './words/words.module';
import { PrismaModule } from './prisma/prisma.module';
import { WordRequestsModule } from './word-requests/word-requests.module'
import { WordEditsModule } from './word-edits/word-edits.module';

@Module({
  imports: [
    AuthModule, 
    WordsModule, 
    PrismaModule, 
    WordRequestsModule,
    WordEditsModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, TypesenseSyncService],
})
export class AppModule {}
