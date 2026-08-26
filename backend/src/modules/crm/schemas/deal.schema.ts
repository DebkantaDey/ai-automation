import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type DealStage =
  | 'discovery'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export type DealDocument = Deal & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Deal {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', default: null, index: true })
  leadId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  @Prop({
    default: 'discovery',
    enum: ['discovery', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'],
    index: true,
  })
  stage: DealStage;

  @Prop({ default: 50, min: 0, max: 100 })
  probability: number;

  @Prop({ type: Date, default: null })
  expectedCloseDate?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  assignedUserId?: Types.ObjectId;

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

export const DealSchema = SchemaFactory.createForClass(Deal);

DealSchema.index({ organizationId: 1, stage: 1, isDeleted: 1 });
DealSchema.index({ organizationId: 1, value: -1 });
