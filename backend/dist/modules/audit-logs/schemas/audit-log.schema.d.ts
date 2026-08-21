import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type AuditLogDocument = AuditLog & Document;
export declare class AuditLog {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    userId?: Types.ObjectId;
    action: string;
    entityType: string;
    entityId?: string;
    changes: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export declare const AuditLogSchema: MongooseSchema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, Document<unknown, any, AuditLog, any, {}> & AuditLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, import("mongoose").FlatRecord<AuditLog>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<AuditLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
