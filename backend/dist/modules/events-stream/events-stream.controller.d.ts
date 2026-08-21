import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventBusService } from '../../core/events/event-bus.service';
export declare class EventsStreamController {
    private readonly eventBus;
    constructor(eventBus: EventBusService);
    streamEvents(orgId: string): Observable<MessageEvent>;
}
