import { WebhooksService, CreateWebhookEndpointDto } from './webhooks.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    createEndpoint(orgId: string, wsId: string, userId: string, dto: CreateWebhookEndpointDto): Promise<import("./schemas/webhook-endpoint.schema").WebhookEndpointDocument>;
    listEndpoints(orgId: string, wsId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/webhook-endpoint.schema").WebhookEndpointDocument, {}, {}> & import("./schemas/webhook-endpoint.schema").WebhookEndpoint & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getEndpointById(id: string, orgId: string, wsId: string): Promise<import("./schemas/webhook-endpoint.schema").WebhookEndpointDocument>;
    updateEndpoint(id: string, orgId: string, wsId: string, updates: Partial<CreateWebhookEndpointDto> & {
        status?: string;
    }): Promise<import("./schemas/webhook-endpoint.schema").WebhookEndpointDocument>;
    rotateSecret(id: string, orgId: string, wsId: string): Promise<import("./schemas/webhook-endpoint.schema").WebhookEndpointDocument>;
    deleteEndpoint(id: string, orgId: string, wsId: string): Promise<{
        success: boolean;
    }>;
    testPing(id: string, orgId: string, wsId: string): Promise<number>;
    listDeliveries(orgId: string, wsId: string, endpointId?: string, pagination?: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/webhook-delivery.schema").WebhookDeliveryDocument, {}, {}> & import("./schemas/webhook-delivery.schema").WebhookDelivery & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
