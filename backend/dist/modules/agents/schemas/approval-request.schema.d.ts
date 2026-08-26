import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ApprovalActionType = 'issue_refund' | 'send_mass_whatsapp' | 'apply_discount' | 'delete_record' | 'custom';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalRequestDocument = ApprovalRequest & Document;
export declare class ApprovalRequest {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    agentId?: Types.ObjectId;
    executionId?: string;
    actionType: ApprovalActionType;
    title: string;
    reason: string;
    payload: Record<string, any>;
    status: ApprovalStatus;
    requestedByAgentName: string;
    reviewedByUserId?: Types.ObjectId;
    reviewedAt?: Date;
    reviewNotes?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ApprovalRequestSchema: MongooseSchema<ApprovalRequest, import("mongoose").Model<ApprovalRequest, any, any, any, Document<unknown, any, ApprovalRequest, any, {}> & ApprovalRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ApprovalRequest, Document<unknown, {}, import("mongoose").FlatRecord<ApprovalRequest>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ApprovalRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
