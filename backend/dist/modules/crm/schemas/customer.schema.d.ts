import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type CustomerStatus = 'active' | 'churned' | 'inactive' | 'onboarding';
export type CustomerTier = 'starter' | 'pro' | 'enterprise' | 'custom';
export type CustomerDocument = Customer & Document;
export declare class Customer {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    status: CustomerStatus;
    tier: CustomerTier;
    totalSpend: number;
    lifetimeValue: number;
    currency: string;
    tags: string[];
    aiInsights?: string;
    churnRisk: string;
    assignedUserId?: Types.ObjectId;
    convertedFromLeadId?: Types.ObjectId;
    customFields?: Record<string, any>;
    lastInteractionAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CustomerSchema: MongooseSchema<Customer, import("mongoose").Model<Customer, any, any, any, Document<unknown, any, Customer, any, {}> & Customer & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Customer, Document<unknown, {}, import("mongoose").FlatRecord<Customer>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Customer> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
