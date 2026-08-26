import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ActivityType =
  | 'message'
  | 'invoice'
  | 'appointment'
  | 'task'
  | 'ai_interaction'
  | 'note'
  | 'stage_change'
  | 'call'
  | 'email';

export type CustomerActivityDocument = CustomerActivity & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class CustomerActivity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', default: null })
  leadId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['message', 'invoice', 'appointment', 'task', 'ai_interaction', 'note', 'stage_change', 'call', 'email'],
    index: true,
  })
  activityType: ActivityType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: 'human', enum: ['human', 'ai', 'system'] })
  source: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  createdAt: Date;
}

export const CustomerActivitySchema = SchemaFactory.createForClass(CustomerActivity);

CustomerActivitySchema.index({ customerId: 1, createdAt: -1 });
CustomerActivitySchema.index({ organizationId: 1, createdAt: -1 });
