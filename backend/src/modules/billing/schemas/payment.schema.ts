import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PaymentStatus = 'succeeded' | 'failed' | 'pending' | 'refunded' | 'processing';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subscription', required: false, default: null })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: String, enum: ['stripe', 'razorpay', 'manual'], required: true })
  provider: string;

  @Prop({ required: true, index: true, trim: true })
  providerPaymentId: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  @Prop({
    type: String,
    enum: ['succeeded', 'failed', 'pending', 'refunded', 'processing'],
    default: 'pending',
    index: true,
  })
  status: PaymentStatus;

  @Prop({ required: false, trim: true })
  paymentMethod?: string;

  @Prop({ type: Object, default: {} })
  paymentMethodDetails?: {
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
    bank?: string;
    wallet?: string;
  };

  @Prop({ required: false, trim: true })
  receiptUrl?: string;

  @Prop({ required: false, trim: true })
  failureReason?: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ organizationId: 1, createdAt: -1 });
PaymentSchema.index({ provider: 1, providerPaymentId: 1 });
