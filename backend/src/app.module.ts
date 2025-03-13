import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { TypesenseSyncService } from './typesense/sync';
import { UsersModule } from './users/users.module';
import { WordsController } from './words/words.controller';
import { WordsModule } from './words/words.module';
import { WordsService } from './words/words.service';
import { PrismaModule } from './prisma/prisma.module';
import { WordRequestsController } from './word-requests/word-requests.controller'
import { WordRequestsModule } from './word-requests/word-requests.module'

@Module({
  imports: [AuthModule, UsersModule, WordsModule, PrismaModule, WordRequestsModule],
  controllers: [AppController, WordsController],
  providers: [AppService, WordsService, PrismaService, TypesenseSyncService],
})
export class AppModule {}
