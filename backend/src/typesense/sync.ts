import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class TypesenseSyncService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}
  onApplicationBootstrap() {
    this.syncWordsToTypesense();
  }

  async syncWordsToTypesense() {
    
  }

}
