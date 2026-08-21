import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type IntegrationConnectionDocument = IntegrationConnection & Document;
export declare class IntegrationConnection {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    provider: string;
    name: string;
    status: string;
    authType: string;
    credentials: {
        encryptedAccessToken?: string;
        encryptedRefreshToken?: string;
        iv?: string;
        tag?: string;
        apiKey?: string;
        webhookUrl?: string;
    };
    metadata: {
        accountEmail?: string;
        accountName?: string;
        scopes?: string[];
        botId?: string;
        teamId?: string;
    };
    errorMessage?: string;
    lastSyncedAt: Date;
    createdBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const IntegrationConnectionSchema: MongooseSchema<IntegrationConnection, import("mongoose").Model<IntegrationConnection, any, any, any, Document<unknown, any, IntegrationConnection, any, {}> & IntegrationConnection & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IntegrationConnection, Document<unknown, {}, import("mongoose").FlatRecord<IntegrationConnection>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<IntegrationConnection> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
