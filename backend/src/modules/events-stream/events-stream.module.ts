import { Module } from '@nestjs/common';
import { EventsStreamController } from './events-stream.controller';
import { EventsModule } from '../../core/events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [EventsStreamController],
})
export class EventsStreamModule {}
