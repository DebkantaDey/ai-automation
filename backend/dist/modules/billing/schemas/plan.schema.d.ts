import { Document } from 'mongoose';
export interface PlanLimits {
    maxUsers: number;
    maxWorkspaces: number;
    maxWorkflows: number;
    maxIntegrations: number;
    maxWorkflowExecutions: number;
    maxAIExecutions: number;
    maxAITokens: number;
    maxStorage: number;
    maxAPIRequests: number;
    maxKnowledgeDocuments: number;
}
export type PlanDocument = Plan & Document;
export declare class Plan {
    name: string;
    slug: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    features: string[];
    limits: PlanLimits;
    isActive: boolean;
    isPublic: boolean;
    isPopular: boolean;
    providerReferences: Record<string, {
        monthlyPriceId?: string;
        yearlyPriceId?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PlanSchema: import("mongoose").Schema<Plan, import("mongoose").Model<Plan, any, any, any, Document<unknown, any, Plan, any, {}> & Plan & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Plan, Document<unknown, {}, import("mongoose").FlatRecord<Plan>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Plan> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
