import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type KnowledgeBaseDocument = KnowledgeBase & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class KnowledgeBase {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 0 })
  documentsCount: number;

  @Prop({ default: 0 })
  totalChunks: number;

  @Prop({ default: 'text-embedding-3-small' })
  embeddingModel: string;

  @Prop({ default: 'active', enum: ['active', 'archived'], index: true })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const KnowledgeBaseSchema = SchemaFactory.createForClass(KnowledgeBase);

KnowledgeBaseSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
