import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ActivityType = 'message' | 'invoice' | 'appointment' | 'task' | 'ai_interaction' | 'note' | 'stage_change' | 'call' | 'email';
export type CustomerActivityDocument = CustomerActivity & Document;
export declare class CustomerActivity {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    customerId: Types.ObjectId;
    leadId?: Types.ObjectId;
    activityType: ActivityType;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
    source: string;
    createdBy?: Types.ObjectId;
    createdAt: Date;
}
export declare const CustomerActivitySchema: MongooseSchema<CustomerActivity, import("mongoose").Model<CustomerActivity, any, any, any, Document<unknown, any, CustomerActivity, any, {}> & CustomerActivity & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CustomerActivity, Document<unknown, {}, import("mongoose").FlatRecord<CustomerActivity>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<CustomerActivity> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
