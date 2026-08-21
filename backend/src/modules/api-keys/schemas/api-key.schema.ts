import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class ApiKey {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  keyPrefix: string; // e.g. "ak_live_7a8b..."

  @Prop({ required: true, select: false, index: true })
  keyHash: string; // SHA-256 hash of the full secret token

  @Prop({ type: [String], default: ['*'] })
  scopes: string[]; // e.g. ['workflows:read', 'workflows:execute', 'agents:run', 'kb:query']

  @Prop({ default: null })
  expiresAt?: Date;

  @Prop({ default: 'active', enum: ['active', 'revoked'], index: true })
  status: string;

  @Prop({ default: null })
  lastUsedAt?: Date;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

ApiKeySchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
ApiKeySchema.index({ keyHash: 1, status: 1 });
