import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ApprovalActionType =
  | 'issue_refund'
  | 'send_mass_whatsapp'
  | 'apply_discount'
  | 'delete_record'
  | 'custom';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalRequestDocument = ApprovalRequest & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class ApprovalRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', default: null, index: true })
  agentId?: Types.ObjectId;

  @Prop({ default: '' })
  executionId?: string;

  @Prop({
    required: true,
    enum: ['issue_refund', 'send_mass_whatsapp', 'apply_discount', 'delete_record', 'custom'],
    index: true,
  })
  actionType: ApprovalActionType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ type: Object, default: {} })
  payload: Record<string, any>;

  @Prop({
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
    index: true,
  })
  status: ApprovalStatus;

  @Prop({ default: 'AI Agent' })
  requestedByAgentName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  reviewedByUserId?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  reviewedAt?: Date;

  @Prop({ default: '', trim: true })
  reviewNotes?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ApprovalRequestSchema = SchemaFactory.createForClass(ApprovalRequest);

ApprovalRequestSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
ApprovalRequestSchema.index({ organizationId: 1, createdAt: -1 });
