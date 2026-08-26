import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ChannelType } from './conversation.schema';

export type MessageDirection = 'inbound' | 'outbound';
export type SenderType = 'customer' | 'ai' | 'human' | 'system';
export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type MessageDocument = Message & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversation', required: true, index: true })
  conversationId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['whatsapp', 'email', 'webchat', 'sms'],
  })
  channel: ChannelType;

  @Prop({
    required: true,
    enum: ['inbound', 'outbound'],
    index: true,
  })
  direction: MessageDirection;

  @Prop({
    required: true,
    enum: ['customer', 'ai', 'human', 'system'],
    index: true,
  })
  senderType: SenderType;

  @Prop({ default: '' })
  senderId?: string;

  @Prop({ required: true, trim: true })
  senderName: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({
    type: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        name: { type: String, default: '' },
        size: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  attachments: Array<{ type: string; url: string; name?: string; size?: number }>;

  @Prop({
    default: 'sent',
    enum: ['sent', 'delivered', 'read', 'failed'],
    index: true,
  })
  status: MessageDeliveryStatus;

  @Prop({ default: '' })
  externalMessageId?: string; // wamid.xxx for WhatsApp or Message-ID for Email

  @Prop({ type: Object, default: {} })
  rawPayload?: Record<string, any>;

  @Prop({ default: '', trim: true })
  aiGeneratedDraft?: string;

  @Prop({ default: 0, min: 0, max: 1 })
  aiConfidence?: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ organizationId: 1, createdAt: -1 });
MessageSchema.index({ externalMessageId: 1 }, { sparse: true });
