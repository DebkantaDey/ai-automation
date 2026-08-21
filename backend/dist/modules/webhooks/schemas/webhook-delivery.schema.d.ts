import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type WebhookDeliveryDocument = WebhookDelivery & Document;
export declare class WebhookDelivery {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    endpointId: Types.ObjectId;
    eventId: string;
    eventType: string;
    payload: Record<string, any>;
    status: string;
    attempts: number;
    httpStatusCode?: number;
    responseBody?: string;
    durationMs: number;
    error?: string;
    nextRetryAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WebhookDeliverySchema: MongooseSchema<WebhookDelivery, import("mongoose").Model<WebhookDelivery, any, any, any, Document<unknown, any, WebhookDelivery, any, {}> & WebhookDelivery & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WebhookDelivery, Document<unknown, {}, import("mongoose").FlatRecord<WebhookDelivery>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WebhookDelivery> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
