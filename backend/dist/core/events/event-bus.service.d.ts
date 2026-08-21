import { WebhooksService } from '../../modules/webhooks/webhooks.service';
export interface DomainEvent<T = any> {
    id: string;
    type: string;
    organizationId?: string;
    workspaceId?: string;
    timestamp: Date;
    data: T;
}
export declare class EventBusService {
    private readonly webhooksService?;
    private readonly logger;
    private readonly emitter;
    constructor(webhooksService?: WebhooksService);
    on(eventType: string, listener: (event: DomainEvent) => Promise<void> | void): void;
    emit<T = any>(eventType: string, organizationId?: string, workspaceId?: string, data?: T): Promise<void>;
}
