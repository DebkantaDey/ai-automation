import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | 'failed';

export interface InvoiceLineItem {
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
}

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Invoice {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subscription', required: false, default: null })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: String, enum: ['stripe', 'razorpay', 'manual'], required: true })
  provider: string;

  @Prop({ required: true, index: true, trim: true })
  providerInvoiceId: string;

  @Prop({ required: false, trim: true })
  invoiceNumber?: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 0, min: 0 })
  amountPaid: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  @Prop({
    type: String,
    enum: ['draft', 'open', 'paid', 'uncollectible', 'void', 'failed'],
    default: 'open',
    index: true,
  })
  status: InvoiceStatus;

  @Prop({ required: false, trim: true })
  invoiceUrl?: string;

  @Prop({ required: false, trim: true })
  invoicePdf?: string;

  @Prop({ default: Date.now })
  issueDate: Date;

  @Prop({ default: null })
  dueDate?: Date;

  @Prop({ default: null })
  paidAt?: Date;

  @Prop({ type: Array, default: [] })
  lineItems: InvoiceLineItem[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ organizationId: 1, createdAt: -1 });
InvoiceSchema.index({ provider: 1, providerInvoiceId: 1 });
