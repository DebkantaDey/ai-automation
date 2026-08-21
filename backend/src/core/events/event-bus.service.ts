import { Injectable, Logger, Optional } from '@nestjs/common';
import { EventEmitter } from 'events';
import { WebhooksService } from '../../modules/webhooks/webhooks.service';

export interface DomainEvent<T = any> {
  id: string;
  type: string;
  organizationId?: string;
  workspaceId?: string;
  timestamp: Date;
  data: T;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly emitter = new EventEmitter();

  constructor(
    @Optional() private readonly webhooksService?: WebhooksService,
  ) {
    this.emitter.setMaxListeners(50);
  }

  on(eventType: string, listener: (event: DomainEvent) => Promise<void> | void): void {
    this.emitter.on(eventType, listener);
  }

  async emit<T = any>(
    eventType: string,
    organizationId?: string,
    workspaceId?: string,
    data: T = {} as any,
  ): Promise<void> {
    const event: DomainEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: eventType,
      organizationId,
      workspaceId,
      timestamp: new Date(),
      data,
    };

    this.logger.log(`[EventBus] Emitted [${eventType}] for Org [${organizationId || 'global'}]`);

    // 1. Dispatch to local internal module listeners
    this.emitter.emit(eventType, event);
    this.emitter.emit('*', event);

    // 2. Automatically dispatch to registered outbound webhooks if tenant scoped
    if (this.webhooksService && organizationId) {
      try {
        await this.webhooksService.dispatchOutboundEvent(
          organizationId,
          workspaceId || '',
          eventType,
          {
            eventId: event.id,
            eventType: event.type,
            timestamp: event.timestamp.toISOString(),
            data: event.data,
          },
        );
      } catch (err: any) {
        this.logger.warn(`Failed to dispatch event [${eventType}] to outbound webhooks: ${err.message}`);
      }
    }
  }
}
