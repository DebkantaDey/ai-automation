import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | 'failed';
export interface InvoiceLineItem {
    description: string;
    amount: number;
    quantity: number;
    unitPrice: number;
}
export type InvoiceDocument = Invoice & Document;
export declare class Invoice {
    organizationId: Types.ObjectId;
    subscriptionId?: Types.ObjectId;
    provider: string;
    providerInvoiceId: string;
    invoiceNumber?: string;
    amount: number;
    amountPaid: number;
    currency: string;
    status: InvoiceStatus;
    invoiceUrl?: string;
    invoicePdf?: string;
    issueDate: Date;
    dueDate?: Date;
    paidAt?: Date;
    lineItems: InvoiceLineItem[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InvoiceSchema: MongooseSchema<Invoice, import("mongoose").Model<Invoice, any, any, any, Document<unknown, any, Invoice, any, {}> & Invoice & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Invoice, Document<unknown, {}, import("mongoose").FlatRecord<Invoice>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Invoice> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
