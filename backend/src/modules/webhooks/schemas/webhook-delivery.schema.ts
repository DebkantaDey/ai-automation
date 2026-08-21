import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type WebhookDeliveryDocument = WebhookDelivery & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class WebhookDelivery {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'WebhookEndpoint', required: true, index: true })
  endpointId: Types.ObjectId;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  eventType: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({
    default: 'delivered',
    enum: ['delivered', 'failed', 'retrying'],
    index: true,
  })
  status: string;

  @Prop({ default: 1 })
  attempts: number;

  @Prop({ default: 0 })
  httpStatusCode?: number;

  @Prop({ default: '' })
  responseBody?: string;

  @Prop({ default: 0 })
  durationMs: number;

  @Prop({ default: null })
  error?: string;

  @Prop({ default: null })
  nextRetryAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const WebhookDeliverySchema = SchemaFactory.createForClass(WebhookDelivery);

WebhookDeliverySchema.index({ endpointId: 1, createdAt: -1 });
WebhookDeliverySchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
