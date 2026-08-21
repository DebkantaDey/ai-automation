import { Controller, Get, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { EventBusService, DomainEvent } from '../../core/events/event-bus.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { CurrentOrganizationId, RequireTenant } from '../../core/tenancy/tenant.decorators';

@ApiTags('Real-Time Events Stream')
@Controller('events')
export class EventsStreamController {
  constructor(private readonly eventBus: EventBusService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequireTenant()
  @Sse('stream')
  @ApiOperation({ summary: 'Subscribe to real-time Server-Sent Events (SSE) stream for active organization' })
  streamEvents(@CurrentOrganizationId() orgId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const listener = (event: DomainEvent) => {
        if (!event.organizationId || event.organizationId === orgId) {
          subscriber.next({
            data: {
              type: event.type,
              timestamp: event.timestamp.toISOString(),
              payload: event.data,
            },
          });
        }
      };

      this.eventBus.on('*', listener);

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        subscriber.next({
          data: {
            type: 'system.heartbeat',
            timestamp: new Date().toISOString(),
          },
        });
      }, 30000);

      return () => {
        clearInterval(heartbeat);
      };
    });
  }
}
