import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'incomplete';

export type BillingInterval = 'monthly' | 'yearly';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Subscription {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, unique: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['stripe', 'razorpay', 'manual'],
    default: 'stripe',
  })
  provider: string;

  @Prop({ required: false, default: null })
  providerCustomerId?: string;

  @Prop({ required: false, default: null, index: true })
  providerSubscriptionId?: string;

  @Prop({
    type: String,
    enum: ['active', 'trialing', 'past_due', 'paused', 'cancelled', 'expired', 'incomplete'],
    default: 'active',
    index: true,
  })
  status: SubscriptionStatus;

  @Prop({
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly',
  })
  billingInterval: BillingInterval;

  @Prop({ default: Date.now })
  currentPeriodStart: Date;

  @Prop({
    default: () => new Date(Date.now() + 30 * 24 * 3600 * 1000),
  })
  currentPeriodEnd: Date;

  @Prop({ default: null })
  trialStart?: Date;

  @Prop({ default: null })
  trialEnd?: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop({ default: null })
  cancelledAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
