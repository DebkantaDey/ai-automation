import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongoDoc, Schema as MongooseSchema, Types } from 'mongoose';

export type DocumentChunkDocument = DocumentChunk & MongoDoc;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class DocumentChunk {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'KnowledgeBase', required: true, index: true })
  knowledgeBaseId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Document', required: true, index: true })
  documentId: Types.ObjectId;

  @Prop({ required: true })
  chunkIndex: number;

  @Prop({ required: true })
  text: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const DocumentChunkSchema = SchemaFactory.createForClass(DocumentChunk);

DocumentChunkSchema.index({ knowledgeBaseId: 1, documentId: 1 });
DocumentChunkSchema.index({ organizationId: 1, workspaceId: 1, knowledgeBaseId: 1 });
