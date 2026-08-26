import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

export type PaymentLedgerDocument = PaymentLedger & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class PaymentLedger {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Invoice', required: true })
  invoiceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  @Prop({
    default: 'succeeded',
    enum: ['succeeded', 'pending', 'failed', 'refunded'],
    index: true,
  })
  status: PaymentStatus;

  @Prop({ default: 'stripe', enum: ['stripe', 'razorpay', 'manual', 'wire'] })
  provider: string;

  @Prop({ default: '', trim: true })
  transactionId?: string;

  @Prop({ default: 'card', trim: true })
  paymentMethod?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  createdAt: Date;
}

export const PaymentLedgerSchema = SchemaFactory.createForClass(PaymentLedger);

PaymentLedgerSchema.index({ organizationId: 1, createdAt: -1 });
PaymentLedgerSchema.index({ invoiceId: 1 });
