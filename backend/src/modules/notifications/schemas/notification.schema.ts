import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'info', enum: ['info', 'success', 'warning', 'error'], index: true })
  type: string;

  @Prop({ required: true, index: true })
  event: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ default: 'in_app', enum: ['in_app', 'email', 'slack', 'webhook'] })
  channel: string;

  @Prop({ default: '' })
  linkUrl?: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ organizationId: 1, userId: 1, isRead: 1, createdAt: -1 });
