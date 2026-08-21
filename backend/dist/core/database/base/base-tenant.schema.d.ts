import { Document, Types } from 'mongoose';
export declare abstract class BaseTenantDocument extends Document {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
