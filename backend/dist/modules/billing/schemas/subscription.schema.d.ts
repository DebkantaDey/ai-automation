import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired' | 'incomplete';
export type BillingInterval = 'monthly' | 'yearly';
export type SubscriptionDocument = Subscription & Document;
export declare class Subscription {
    organizationId: Types.ObjectId;
    planId: Types.ObjectId;
    provider: string;
    providerCustomerId?: string;
    providerSubscriptionId?: string;
    status: SubscriptionStatus;
    billingInterval: BillingInterval;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialStart?: Date;
    trialEnd?: Date;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SubscriptionSchema: MongooseSchema<Subscription, import("mongoose").Model<Subscription, any, any, any, Document<unknown, any, Subscription, any, {}> & Subscription & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Subscription, Document<unknown, {}, import("mongoose").FlatRecord<Subscription>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Subscription> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
