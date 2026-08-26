import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';
export type PaymentLedgerDocument = PaymentLedger & Document;
export declare class PaymentLedger {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    invoiceId: Types.ObjectId;
    customerId: Types.ObjectId;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: string;
    transactionId?: string;
    paymentMethod?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare const PaymentLedgerSchema: MongooseSchema<PaymentLedger, import("mongoose").Model<PaymentLedger, any, any, any, Document<unknown, any, PaymentLedger, any, {}> & PaymentLedger & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PaymentLedger, Document<unknown, {}, import("mongoose").FlatRecord<PaymentLedger>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PaymentLedger> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
