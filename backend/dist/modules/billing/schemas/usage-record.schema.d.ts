import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type UsageRecordDocument = UsageRecord & Document;
export declare class UsageRecord {
    organizationId: Types.ObjectId;
    billingPeriod: string;
    workflowExecutions: number;
    aiExecutions: number;
    aiPromptTokens: number;
    aiCompletionTokens: number;
    aiTotalTokens: number;
    aiCostUsd: number;
    apiRequests: number;
    storageBytes: number;
    integrationsCount: number;
    documentsCount: number;
    lastResetAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UsageRecordSchema: MongooseSchema<UsageRecord, import("mongoose").Model<UsageRecord, any, any, any, Document<unknown, any, UsageRecord, any, {}> & UsageRecord & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UsageRecord, Document<unknown, {}, import("mongoose").FlatRecord<UsageRecord>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<UsageRecord> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
