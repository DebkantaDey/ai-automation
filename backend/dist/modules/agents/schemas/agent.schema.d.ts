import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type AgentDocument = Agent & Document;
export interface AgentLimits {
    maxSteps: number;
    maxTokens: number;
    maxToolCalls: number;
    timeoutSeconds: number;
}
export interface AgentToolConfig {
    name: string;
    description: string;
    connectionId?: string;
    enabled: boolean;
}
export declare class Agent {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    name: string;
    description: string;
    instructions: string;
    provider: string;
    model: string;
    tools: AgentToolConfig[];
    knowledgeSources: string[];
    memorySettings: Record<string, any>;
    limits: AgentLimits;
    status: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AgentSchema: MongooseSchema<Agent, import("mongoose").Model<Agent, any, any, any, Document<unknown, any, Agent, any, {}> & Agent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Agent, Document<unknown, {}, import("mongoose").FlatRecord<Agent>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Agent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
