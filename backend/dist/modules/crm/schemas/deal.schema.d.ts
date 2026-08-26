import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type DealStage = 'discovery' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
export type DealDocument = Deal & Document;
export declare class Deal {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    title: string;
    customerId?: Types.ObjectId;
    leadId?: Types.ObjectId;
    value: number;
    currency: string;
    stage: DealStage;
    probability: number;
    expectedCloseDate?: Date;
    assignedUserId?: Types.ObjectId;
    notes?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DealSchema: MongooseSchema<Deal, import("mongoose").Model<Deal, any, any, any, Document<unknown, any, Deal, any, {}> & Deal & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Deal, Document<unknown, {}, import("mongoose").FlatRecord<Deal>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Deal> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
