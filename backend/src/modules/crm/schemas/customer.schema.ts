import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CustomerStatus = 'active' | 'churned' | 'inactive' | 'onboarding';
export type CustomerTier = 'starter' | 'pro' | 'enterprise' | 'custom';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Customer {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, lowercase: true, trim: true, default: '' })
  email?: string;

  @Prop({ required: false, trim: true, default: '' })
  phone?: string;

  @Prop({ required: false, trim: true, default: '' })
  company?: string;

  @Prop({
    default: 'active',
    enum: ['active', 'churned', 'inactive', 'onboarding'],
    index: true,
  })
  status: CustomerStatus;

  @Prop({
    default: 'starter',
    enum: ['starter', 'pro', 'enterprise', 'custom'],
  })
  tier: CustomerTier;

  @Prop({ default: 0, min: 0 })
  totalSpend: number;

  @Prop({ default: 0, min: 0 })
  lifetimeValue: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '', trim: true })
  aiInsights?: string;

  @Prop({
    default: 'low',
    enum: ['low', 'medium', 'high'],
  })
  churnRisk: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  assignedUserId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', default: null })
  convertedFromLeadId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;

  @Prop({ type: Date, default: null })
  lastInteractionAt?: Date;

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

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ organizationId: 1, isDeleted: 1 });
CustomerSchema.index({ organizationId: 1, email: 1 });
CustomerSchema.index({ organizationId: 1, phone: 1 });
CustomerSchema.index({ organizationId: 1, totalSpend: -1 });
