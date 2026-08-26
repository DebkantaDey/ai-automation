import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentProvider = 'stripe' | 'razorpay' | 'manual' | 'wire';
export declare class InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}
export type InvoiceDocument = Invoice & Document;
export declare class Invoice {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    invoiceNumber: string;
    customerId: Types.ObjectId;
    leadId?: Types.ObjectId;
    items: InvoiceLineItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    currency: string;
    status: InvoiceStatus;
    issuedDate: Date;
    dueDate: Date;
    paidAt?: Date;
    paymentProvider: PaymentProvider;
    paymentReference?: string;
    hostedPaymentUrl?: string;
    pdfUrl?: string;
    notes?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
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
