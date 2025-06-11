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
import { SignVideosModule } from './sign-videos/sign-videos.module';
import { SensesModule } from './senses/senses.module';
import { ExamplesModule } from './examples/examples.module';
import { TranslationsModule } from './translations/translations.module';
import { DefinitionsModule } from './definitions/definitions.module';
import { ExampleTranslationsModule } from './example-translations/example-translations.module';
import { RelationsModule } from './relations/relations.module';
import { MinimalPairsModule } from './minimal-pairs/minimal-pairs.module';

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
    SignVideosModule,
    SensesModule,
    ExamplesModule,
    TranslationsModule,
    DefinitionsModule,
    ExampleTranslationsModule,
    RelationsModule,
    MinimalPairsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
