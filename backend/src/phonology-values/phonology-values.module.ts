import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PhonologyValuesController } from './phonology-values.controller';
import { PhonologyValuesService } from './phonology-values.service';

@Module({
  imports: [EventEmitterModule],
  controllers: [PhonologyValuesController],
  providers: [PhonologyValuesService],
  exports: [PhonologyValuesService],
})
export class PhonologyValuesModule {}
