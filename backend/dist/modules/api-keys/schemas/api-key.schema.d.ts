import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ApiKeyDocument = ApiKey & Document;
export declare class ApiKey {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    name: string;
    keyPrefix: string;
    keyHash: string;
    scopes: string[];
    expiresAt?: Date;
    status: string;
    lastUsedAt?: Date;
    usageCount: number;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ApiKeySchema: MongooseSchema<ApiKey, import("mongoose").Model<ApiKey, any, any, any, Document<unknown, any, ApiKey, any, {}> & ApiKey & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ApiKey, Document<unknown, {}, import("mongoose").FlatRecord<ApiKey>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ApiKey> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
