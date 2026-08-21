import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export interface WorkflowNode {
    id: string;
    type: 'trigger' | 'http_request' | 'condition_branch' | 'transformer_code' | 'ai_generate' | 'ai_agent_tool' | 'human_approval' | 'delay' | string;
    label: string;
    position?: {
        x: number;
        y: number;
    };
    data?: Record<string, any>;
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
}
export interface WorkflowSettings {
    maxExecutionTimeMs: number;
    retryOnFailure: boolean;
    maxRetries: number;
    requireHumanApproval: boolean;
}
export type WorkflowDocument = Workflow & Document;
export declare class Workflow {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    name: string;
    description?: string;
    triggerType: string;
    triggerConfig: Record<string, any>;
    webhookId?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    status: string;
    version: number;
    publishedVersion: number;
    isPublished: boolean;
    settings: WorkflowSettings;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WorkflowSchema: MongooseSchema<Workflow, import("mongoose").Model<Workflow, any, any, any, Document<unknown, any, Workflow, any, {}> & Workflow & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Workflow, Document<unknown, {}, import("mongoose").FlatRecord<Workflow>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Workflow> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
