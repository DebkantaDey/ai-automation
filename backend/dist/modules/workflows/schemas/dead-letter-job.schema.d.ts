import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type DeadLetterStatus = 'failed' | 'retrying' | 'resolved' | 'dismissed';
export type DeadLetterJobDocument = DeadLetterJob & Document;
export declare class DeadLetterJob {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    workflowId: Types.ObjectId;
    executionId: Types.ObjectId;
    jobId: string;
    queueName: string;
    attemptsMade: number;
    maxAttempts: number;
    failedReason: string;
    stackTrace?: string;
    failedStepNodeId?: string;
    inputPayload: Record<string, any>;
    executionSnapshot: Record<string, any>;
    status: DeadLetterStatus;
    replayedAt?: Date;
    replayedByUserId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DeadLetterJobSchema: MongooseSchema<DeadLetterJob, import("mongoose").Model<DeadLetterJob, any, any, any, Document<unknown, any, DeadLetterJob, any, {}> & DeadLetterJob & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DeadLetterJob, Document<unknown, {}, import("mongoose").FlatRecord<DeadLetterJob>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<DeadLetterJob> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
