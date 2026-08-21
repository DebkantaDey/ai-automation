import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type PaymentStatus = 'succeeded' | 'failed' | 'pending' | 'refunded' | 'processing';
export type PaymentDocument = Payment & Document;
export declare class Payment {
    organizationId: Types.ObjectId;
    subscriptionId?: Types.ObjectId;
    provider: string;
    providerPaymentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod?: string;
    paymentMethodDetails?: {
        last4?: string;
        brand?: string;
        expMonth?: number;
        expYear?: number;
        bank?: string;
        wallet?: string;
    };
    receiptUrl?: string;
    failureReason?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PaymentSchema: MongooseSchema<Payment, import("mongoose").Model<Payment, any, any, any, Document<unknown, any, Payment, any, {}> & Payment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, import("mongoose").FlatRecord<Payment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Payment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
