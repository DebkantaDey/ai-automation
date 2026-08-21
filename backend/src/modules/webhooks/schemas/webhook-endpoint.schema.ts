import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type WebhookEndpointDocument = WebhookEndpoint & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class WebhookEndpoint {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ required: true, trim: true })
  secret: string; // e.g. 'whsec_...'

  @Prop({ type: [String], default: ['*'] })
  eventTypes: string[];

  @Prop({ required: false, trim: true, default: '' })
  description?: string;

  @Prop({ default: 'active', enum: ['active', 'disabled'], index: true })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const WebhookEndpointSchema = SchemaFactory.createForClass(WebhookEndpoint);

WebhookEndpointSchema.index({ organizationId: 1, workspaceId: 1, status: 1 });
