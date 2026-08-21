import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { AIUsageStats } from '../../workflows/schemas/workflow-execution.schema';
export type AgentExecutionDocument = AgentExecution & Document;
export interface AgentStepTrace {
    stepNumber: number;
    thought: string;
    toolCall?: {
        name: string;
        input: Record<string, any>;
    };
    observation?: any;
    durationMs?: number;
    tokensUsed?: number;
}
export declare class AgentExecution {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    agentId: Types.ObjectId;
    status: string;
    inputPrompt: string;
    finalOutput?: string;
    steps: AgentStepTrace[];
    aiUsage: AIUsageStats;
    error?: string;
    startedAt: Date;
    finishedAt?: Date;
    durationMs: number;
    triggeredBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AgentExecutionSchema: MongooseSchema<AgentExecution, import("mongoose").Model<AgentExecution, any, any, any, Document<unknown, any, AgentExecution, any, {}> & AgentExecution & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AgentExecution, Document<unknown, {}, import("mongoose").FlatRecord<AgentExecution>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<AgentExecution> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
