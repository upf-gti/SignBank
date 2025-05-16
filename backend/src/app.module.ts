import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypesenseSyncService } from './typesense/sync';
import { MongoDBModule } from './mongodb/mongodb.module';

@Module({
  imports: [
    MongoDBModule,
    AuthModule, 
  ],
  controllers: [AppController],
  providers: [AppService, TypesenseSyncService],
})
export class AppModule {}
