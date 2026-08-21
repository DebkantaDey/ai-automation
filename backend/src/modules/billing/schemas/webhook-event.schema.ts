import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookProcessStatus = 'processed' | 'failed' | 'ignored';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class WebhookEvent {
  @Prop({ type: String, enum: ['stripe', 'razorpay'], required: true })
  provider: 'stripe' | 'razorpay';

  @Prop({ required: true, trim: true })
  providerEventId: string;

  @Prop({ required: true, trim: true })
  eventType: string;

  @Prop({
    type: String,
    enum: ['processed', 'failed', 'ignored'],
    default: 'processed',
    index: true,
  })
  status: WebhookProcessStatus;

  @Prop({ type: Object, default: {} })
  payload: Record<string, any>;

  @Prop({ default: Date.now })
  processedAt: Date;

  @Prop({ required: false })
  error?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

WebhookEventSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });
