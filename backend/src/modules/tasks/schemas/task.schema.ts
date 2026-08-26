import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Task {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, index: true })
  assigneeUserId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', default: null, index: true })
  leadId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workflow', default: null })
  workflowId?: Types.ObjectId;

  @Prop({ default: '' })
  executionId?: string;

  @Prop({
    default: 'medium',
    enum: ['low', 'medium', 'high', 'urgent'],
    index: true,
  })
  priority: TaskPriority;

  @Prop({
    default: 'todo',
    enum: ['todo', 'in_progress', 'completed', 'cancelled'],
    index: true,
  })
  status: TaskStatus;

  @Prop({ type: Date, default: null, index: true })
  dueDate?: Date;

  @Prop({ default: false, index: true })
  isAiGenerated: boolean;

  @Prop({ default: 'Manual Task', trim: true })
  source?: string;

  @Prop({ type: Date, default: null })
  completedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  completedBy?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
TaskSchema.index({ organizationId: 1, assigneeUserId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, dueDate: 1 });
