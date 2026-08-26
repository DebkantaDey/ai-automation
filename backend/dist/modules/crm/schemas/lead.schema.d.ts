import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high';
export type LeadDocument = Lead & Document;
export declare class Lead {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source: string;
    status: LeadStatus;
    priority: LeadPriority;
    leadScore: number;
    scoreConfidence: number;
    scoreReasons: string[];
    scoreGeneratedAt?: Date;
    assignedUserId?: Types.ObjectId;
    tags: string[];
    notes?: string;
    customFields?: Record<string, any>;
    lastContactAt?: Date;
    nextFollowUpAt?: Date;
    convertedCustomerId?: Types.ObjectId;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const LeadSchema: MongooseSchema<Lead, import("mongoose").Model<Lead, any, any, any, Document<unknown, any, Lead, any, {}> & Lead & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Lead, Document<unknown, {}, import("mongoose").FlatRecord<Lead>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Lead> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
