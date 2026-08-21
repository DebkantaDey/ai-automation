import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type WorkspaceStatus = 'active' | 'archived' | 'suspended';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Workspace {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: false, trim: true, default: '' })
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, index: true })
  createdBy?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['active', 'archived', 'suspended'],
    default: 'active',
    index: true,
  })
  status: WorkspaceStatus;

  @Prop({ default: '#3B82F6' })
  color: string;

  @Prop({ default: 'Layers' })
  icon: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: false, index: true })
  isDefault: boolean;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

WorkspaceSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
WorkspaceSchema.index({ organizationId: 1, isDeleted: 1 });
