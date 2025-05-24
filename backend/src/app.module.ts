import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypesenseSyncService } from './typesense/sync';
import { PrismaModule } from './prisma/prisma.module';
import { GlossesModule } from './glosses/glosses.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GlossesModule,
    VideosModule,
  ],
  controllers: [AppController],
  providers: [AppService, TypesenseSyncService],
})
export class AppModule {}
