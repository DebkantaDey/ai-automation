import { Document } from 'mongoose';
export type WebhookProcessStatus = 'processed' | 'failed' | 'ignored';
export type WebhookEventDocument = WebhookEvent & Document;
export declare class WebhookEvent {
    provider: 'stripe' | 'razorpay';
    providerEventId: string;
    eventType: string;
    status: WebhookProcessStatus;
    payload: Record<string, any>;
    processedAt: Date;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WebhookEventSchema: import("mongoose").Schema<WebhookEvent, import("mongoose").Model<WebhookEvent, any, any, any, Document<unknown, any, WebhookEvent, any, {}> & WebhookEvent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WebhookEvent, Document<unknown, {}, import("mongoose").FlatRecord<WebhookEvent>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WebhookEvent> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
