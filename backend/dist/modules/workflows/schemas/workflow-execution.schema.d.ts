import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'waiting_approval' | 'cancelled';
export interface WorkflowStepRun {
    nodeId: string;
    nodeType: string;
    nodeLabel?: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting_approval';
    input?: any;
    output?: any;
    error?: string;
    durationMs?: number;
    retryCount?: number;
    startedAt?: Date;
    completedAt?: Date;
}
export interface AIUsageStats {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
}
export interface ApprovalDetails {
    requiredRole?: string;
    approvalToken?: string;
    nodeId?: string;
    approvedBy?: Types.ObjectId;
    rejectedBy?: Types.ObjectId;
    reason?: string;
    actionTakenAt?: Date;
}
export type WorkflowExecutionDocument = WorkflowExecution & Document;
export declare class WorkflowExecution {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    workflowId: Types.ObjectId;
    version: number;
    triggerType: string;
    triggeredBy?: Types.ObjectId;
    status: ExecutionStatus;
    inputPayload: Record<string, any>;
    outputPayload: Record<string, any>;
    steps: WorkflowStepRun[];
    aiUsage: AIUsageStats;
    approvalDetails?: ApprovalDetails;
    startedAt?: Date;
    finishedAt?: Date;
    durationMs: number;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WorkflowExecutionSchema: MongooseSchema<WorkflowExecution, import("mongoose").Model<WorkflowExecution, any, any, any, Document<unknown, any, WorkflowExecution, any, {}> & WorkflowExecution & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WorkflowExecution, Document<unknown, {}, import("mongoose").FlatRecord<WorkflowExecution>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WorkflowExecution> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
