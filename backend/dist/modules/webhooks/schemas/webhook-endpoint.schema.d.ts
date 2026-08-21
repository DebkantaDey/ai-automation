import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type WebhookEndpointDocument = WebhookEndpoint & Document;
export declare class WebhookEndpoint {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    url: string;
    secret: string;
    eventTypes: string[];
    description?: string;
    status: string;
    createdBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WebhookEndpointSchema: MongooseSchema<WebhookEndpoint, import("mongoose").Model<WebhookEndpoint, any, any, any, Document<unknown, any, WebhookEndpoint, any, {}> & WebhookEndpoint & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WebhookEndpoint, Document<unknown, {}, import("mongoose").FlatRecord<WebhookEndpoint>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WebhookEndpoint> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
