import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ChannelType = 'whatsapp' | 'email' | 'webchat' | 'sms';
export type ConversationStatus = 'open' | 'closed' | 'snoozed';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Conversation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['whatsapp', 'email', 'webchat', 'sms'],
    index: true,
  })
  channel: ChannelType;

  @Prop({ required: true, trim: true })
  contactName: string;

  @Prop({ required: true, trim: true, index: true })
  contactIdentifier: string; // phone number (E.164) or email address

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', default: null, index: true })
  leadId?: Types.ObjectId;

  @Prop({
    default: 'open',
    enum: ['open', 'closed', 'snoozed'],
    index: true,
  })
  status: ConversationStatus;

  @Prop({ default: 0, min: 0 })
  unreadCount: number;

  @Prop({ default: '', trim: true })
  lastMessageText: string;

  @Prop({ type: Date, default: Date.now, index: true })
  lastMessageAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  assignedUserId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', default: null })
  assignedAgentId?: Types.ObjectId;

  @Prop({ default: true, index: true })
  isAiHandled: boolean;

  @Prop({ default: '', trim: true })
  aiTakeoverReason?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

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

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ organizationId: 1, channel: 1, isDeleted: 1 });
ConversationSchema.index({ organizationId: 1, contactIdentifier: 1 });
ConversationSchema.index({ organizationId: 1, lastMessageAt: -1 });
