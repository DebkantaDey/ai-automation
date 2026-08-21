import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { WorkflowNode, WorkflowEdge, WorkflowSettings } from './workflow.schema';
export type WorkflowVersionDocument = WorkflowVersion & Document;
export declare class WorkflowVersion {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    workflowId: Types.ObjectId;
    version: number;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    triggerConfig: Record<string, any>;
    settings: WorkflowSettings;
    publishedBy?: Types.ObjectId;
    changelog?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WorkflowVersionSchema: MongooseSchema<WorkflowVersion, import("mongoose").Model<WorkflowVersion, any, any, any, Document<unknown, any, WorkflowVersion, any, {}> & WorkflowVersion & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WorkflowVersion, Document<unknown, {}, import("mongoose").FlatRecord<WorkflowVersion>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WorkflowVersion> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
