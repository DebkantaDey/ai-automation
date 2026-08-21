import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type IntegrationConnectionDocument = IntegrationConnection & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class IntegrationConnection {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  provider: string; // 'slack' | 'google_sheets' | 'gmail' | 'hubspot' | 'discord' | 'custom_webhook'

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    default: 'connected',
    enum: ['connected', 'error', 'disconnected'],
    index: true,
  })
  status: string;

  @Prop({
    default: 'api_key',
    enum: ['oauth2', 'api_key', 'webhook_url'],
  })
  authType: string;

  @Prop({
    type: {
      encryptedAccessToken: { type: String, select: false },
      encryptedRefreshToken: { type: String, select: false },
      iv: { type: String, select: false },
      tag: { type: String, select: false },
      apiKey: { type: String, select: false },
      webhookUrl: { type: String, select: false },
    },
    default: {},
  })
  credentials: {
    encryptedAccessToken?: string;
    encryptedRefreshToken?: string;
    iv?: string;
    tag?: string;
    apiKey?: string;
    webhookUrl?: string;
  };

  @Prop({ type: Object, default: {} })
  metadata: {
    accountEmail?: string;
    accountName?: string;
    scopes?: string[];
    botId?: string;
    teamId?: string;
  };

  @Prop({ default: null })
  errorMessage?: string;

  @Prop({ default: () => new Date() })
  lastSyncedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const IntegrationConnectionSchema = SchemaFactory.createForClass(IntegrationConnection);

IntegrationConnectionSchema.index({ organizationId: 1, workspaceId: 1, provider: 1 });
