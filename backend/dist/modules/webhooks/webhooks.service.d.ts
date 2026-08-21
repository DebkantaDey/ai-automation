import { Model, Types } from 'mongoose';
import { Queue } from 'bullmq';
import { WebhookEndpoint, WebhookEndpointDocument } from './schemas/webhook-endpoint.schema';
import { WebhookDelivery, WebhookDeliveryDocument } from './schemas/webhook-delivery.schema';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export interface CreateWebhookEndpointDto {
    url: string;
    eventTypes?: string[];
    description?: string;
}
export declare class WebhooksService {
    private readonly endpointModel;
    private readonly deliveryModel;
    private readonly webhookQueue;
    private readonly logger;
    constructor(endpointModel: Model<WebhookEndpointDocument>, deliveryModel: Model<WebhookDeliveryDocument>, webhookQueue: Queue);
    private toObjectId;
    createEndpoint(organizationId: string, workspaceId: string, userId: string, dto: CreateWebhookEndpointDto): Promise<WebhookEndpointDocument>;
    listEndpoints(organizationId: string, workspaceId: string): Promise<(import("mongoose").Document<unknown, {}, WebhookEndpointDocument, {}, {}> & WebhookEndpoint & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getEndpointById(id: string, organizationId: string, workspaceId: string): Promise<WebhookEndpointDocument>;
    updateEndpoint(id: string, organizationId: string, workspaceId: string, updates: Partial<CreateWebhookEndpointDto> & {
        status?: string;
    }): Promise<WebhookEndpointDocument>;
    rotateSecret(id: string, organizationId: string, workspaceId: string): Promise<WebhookEndpointDocument>;
    deleteEndpoint(id: string, organizationId: string, workspaceId: string): Promise<void>;
    dispatchOutboundEvent(organizationId: string, workspaceId: string, eventType: string, payload: Record<string, any>): Promise<number>;
    listDeliveries(organizationId: string, workspaceId: string, endpointId?: string, pagination?: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, WebhookDeliveryDocument, {}, {}> & WebhookDelivery & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    testPing(endpointId: string, organizationId: string, workspaceId: string): Promise<number>;
}
