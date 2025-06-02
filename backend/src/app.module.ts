import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { GlossesModule } from './glosses/glosses.module';
import { GlossDataModule } from './gloss-data/gloss-data.module';
import { VideosModule } from './videos/videos.module';
import { SearchModule } from './search/search.module';
import { TypesenseModule } from './typesense/typesense.module';
import { GlossRequestsModule } from './gloss-requests/gloss-requests.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GlossRequestsModule,
    GlossesModule,
    GlossDataModule,
    VideosModule,
    SearchModule,
    TypesenseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
