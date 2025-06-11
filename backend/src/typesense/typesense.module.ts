import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypesenseService } from './typesense.service';
import { TypesenseController } from './typesense.controller';
import { TypesenseScheduler } from './typesense.scheduler';
import { TypesenseSubscriber } from './typesense.subscriber';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot()
  ],
  controllers: [TypesenseController],
  providers: [TypesenseService, TypesenseScheduler, TypesenseSubscriber],
  exports: [TypesenseService],
})
export class TypesenseModule {} 