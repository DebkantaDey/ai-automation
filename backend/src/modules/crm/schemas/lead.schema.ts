import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export type LeadPriority = 'low' | 'medium' | 'high';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Lead {
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
    default: 'website',
    enum: ['website', 'whatsapp', 'email', 'manual', 'referral', 'api', 'phone', 'other'],
    index: true,
  })
  source: string;

  @Prop({
    default: 'new',
    enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'],
    index: true,
  })
  status: LeadStatus;

  @Prop({
    default: 'medium',
    enum: ['low', 'medium', 'high'],
    index: true,
  })
  priority: LeadPriority;

  @Prop({ default: 50, min: 0, max: 100, index: true })
  leadScore: number;

  @Prop({ default: 0.8, min: 0, max: 1 })
  scoreConfidence: number;

  @Prop({ type: [String], default: [] })
  scoreReasons: string[];

  @Prop({ type: Date, default: null })
  scoreGeneratedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  assignedUserId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '', trim: true })
  notes?: string;

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;

  @Prop({ type: Date, default: null })
  lastContactAt?: Date;

  @Prop({ type: Date, default: null })
  nextFollowUpAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', default: null })
  convertedCustomerId?: Types.ObjectId;

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

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
LeadSchema.index({ organizationId: 1, leadScore: -1 });
LeadSchema.index({ organizationId: 1, email: 1 });
LeadSchema.index({ organizationId: 1, phone: 1 });
