import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentProvider = 'stripe' | 'razorpay' | 'manual' | 'wire';

export class InvoiceLineItem {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, default: 1, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  amount: number;
}

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Invoice {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  invoiceNumber: string; // e.g. INV-2026-001

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', default: null })
  leadId?: Types.ObjectId;

  @Prop({ type: [InvoiceLineItem], default: [] })
  items: InvoiceLineItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  taxRate: number; // percentage e.g. 18

  @Prop({ default: 0, min: 0 })
  taxAmount: number;

  @Prop({ default: 0, min: 0 })
  discountAmount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  @Prop({
    default: 'draft',
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
    index: true,
  })
  status: InvoiceStatus;

  @Prop({ type: Date, default: Date.now })
  issuedDate: Date;

  @Prop({ type: Date, required: true, index: true })
  dueDate: Date;

  @Prop({ type: Date, default: null })
  paidAt?: Date;

  @Prop({
    default: 'stripe',
    enum: ['stripe', 'razorpay', 'manual', 'wire'],
  })
  paymentProvider: PaymentProvider;

  @Prop({ default: '', trim: true })
  paymentReference?: string;

  @Prop({ default: '', trim: true })
  hostedPaymentUrl?: string;

  @Prop({ default: '', trim: true })
  pdfUrl?: string;

  @Prop({ default: '', trim: true })
  notes?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
InvoiceSchema.index({ organizationId: 1, dueDate: 1 });
