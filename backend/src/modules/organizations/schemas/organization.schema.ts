import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type OrganizationStatus = 'active' | 'suspended' | 'trial' | 'cancelled';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Organization {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: false })
  logo?: string;

  @Prop({ required: false })
  logoUrl?: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ required: false, trim: true })
  industry?: string;

  @Prop({ required: false, trim: true })
  website?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['active', 'suspended', 'trial', 'cancelled'],
    default: 'active',
    index: true,
  })
  status: OrganizationStatus;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 'US' })
  country: string;

  @Prop({ default: 'USD' })
  defaultCurrency: string;

  @Prop({ default: 'free', enum: ['free', 'starter', 'pro', 'enterprise'] })
  plan: string;

  @Prop({ required: false, index: true })
  billingCustomerId?: string;

  @Prop({ required: false })
  subscriptionId?: string;

  @Prop({ default: 'active', enum: ['active', 'trialing', 'past_due', 'canceled', 'paused'] })
  subscriptionStatus: string;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.index({ ownerId: 1, isDeleted: 1 });
OrganizationSchema.index({ status: 1, isDeleted: 1 });
