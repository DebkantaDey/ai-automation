import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type DeadLetterStatus = 'failed' | 'retrying' | 'resolved' | 'dismissed';

export type DeadLetterJobDocument = DeadLetterJob & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class DeadLetterJob {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workflow', required: true, index: true })
  workflowId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'WorkflowExecution', required: true })
  executionId: Types.ObjectId;

  @Prop({ default: '', index: true })
  jobId: string;

  @Prop({ default: 'workflow-execution' })
  queueName: string;

  @Prop({ default: 3 })
  attemptsMade: number;

  @Prop({ default: 3 })
  maxAttempts: number;

  @Prop({ required: true })
  failedReason: string;

  @Prop({ default: '' })
  stackTrace?: string;

  @Prop({ default: '' })
  failedStepNodeId?: string;

  @Prop({ type: Object, default: {} })
  inputPayload: Record<string, any>;

  @Prop({ type: Object, default: {} })
  executionSnapshot: Record<string, any>;

  @Prop({
    default: 'failed',
    enum: ['failed', 'retrying', 'resolved', 'dismissed'],
    index: true,
  })
  status: DeadLetterStatus;

  @Prop({ type: Date, default: null })
  replayedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  replayedByUserId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const DeadLetterJobSchema = SchemaFactory.createForClass(DeadLetterJob);

DeadLetterJobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
DeadLetterJobSchema.index({ executionId: 1 });
