import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';

@Injectable()
export class TypesenseSyncService implements OnApplicationBootstrap {
  constructor(private readonly mongodb: MongoDBService) {}
  onApplicationBootstrap() {
    this.syncWordsToTypesense();
  }

  async syncWordsToTypesense() {
    
  }

}
