import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UsageRecordDocument = UsageRecord & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class UsageRecord {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  // Format: 'YYYY-MM' (e.g. '2026-08')
  @Prop({ required: true, index: true })
  billingPeriod: string;

  @Prop({ default: 0 })
  workflowExecutions: number;

  @Prop({ default: 0 })
  aiExecutions: number;

  @Prop({ default: 0 })
  aiPromptTokens: number;

  @Prop({ default: 0 })
  aiCompletionTokens: number;

  @Prop({ default: 0 })
  aiTotalTokens: number;

  @Prop({ default: 0 })
  aiCostUsd: number;

  @Prop({ default: 0 })
  apiRequests: number;

  @Prop({ default: 0 })
  storageBytes: number;

  @Prop({ default: 0 })
  integrationsCount: number;

  @Prop({ default: 0 })
  documentsCount: number;

  @Prop({ default: () => new Date() })
  lastResetAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UsageRecordSchema = SchemaFactory.createForClass(UsageRecord);

UsageRecordSchema.index({ organizationId: 1, billingPeriod: 1 }, { unique: true });
