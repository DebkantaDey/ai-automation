import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type OrganizationStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type OrganizationDocument = Organization & Document;
export declare class Organization {
    name: string;
    slug: string;
    logo?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    website?: string;
    ownerId: Types.ObjectId;
    status: OrganizationStatus;
    timezone: string;
    country: string;
    defaultCurrency: string;
    plan: string;
    billingCustomerId?: string;
    subscriptionId?: string;
    subscriptionStatus: string;
    settings: Record<string, any>;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const OrganizationSchema: MongooseSchema<Organization, import("mongoose").Model<Organization, any, any, any, Document<unknown, any, Organization, any, {}> & Organization & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Organization, Document<unknown, {}, import("mongoose").FlatRecord<Organization>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Organization> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
