import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { WebhookDeliveryDocument } from '../schemas/webhook-delivery.schema';
export interface WebhookDispatchJobData {
    organizationId: string;
    workspaceId: string;
    endpointId: string;
    url: string;
    secret: string;
    eventId: string;
    eventType: string;
    payload: Record<string, any>;
}
export declare class WebhookDispatchProcessor extends WorkerHost {
    private readonly deliveryModel;
    private readonly logger;
    constructor(deliveryModel: Model<WebhookDeliveryDocument>);
    process(job: Job<WebhookDispatchJobData>): Promise<any>;
}
