import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongoDoc, Schema as MongooseSchema, Types } from 'mongoose';

export type DocumentDocument = Document & MongoDoc;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeBase', required: true, index: true })
  knowledgeBaseId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'text/plain' })
  mimeType: string;

  @Prop({ default: 0 })
  sizeBytes: number;

  @Prop({ default: '' })
  fileUrl?: string;

  @Prop({ default: '' })
  rawText?: string;

  @Prop({ default: 0 })
  chunksCount: number;

  @Prop({
    default: 'uploaded',
    enum: ['uploaded', 'processing', 'processed', 'failed'],
    index: true,
  })
  status: string;

  @Prop({ default: null })
  error?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);

DocumentSchema.index({ knowledgeBaseId: 1, createdAt: -1 });
DocumentSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
