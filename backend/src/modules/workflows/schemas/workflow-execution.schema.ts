import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ExecutionStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'waiting_approval'
  | 'cancelled';

export interface WorkflowStepRun {
  nodeId: string;
  nodeType: string;
  nodeLabel?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting_approval';
  input?: any;
  output?: any;
  error?: string;
  durationMs?: number;
  retryCount?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface AIUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface ApprovalDetails {
  requiredRole?: string;
  approvalToken?: string;
  nodeId?: string;
  approvedBy?: Types.ObjectId;
  rejectedBy?: Types.ObjectId;
  reason?: string;
  actionTakenAt?: Date;
}

export type WorkflowExecutionDocument = WorkflowExecution & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class WorkflowExecution {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workflow', required: true, index: true })
  workflowId: Types.ObjectId;

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: 'manual', index: true })
  triggerType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  triggeredBy?: Types.ObjectId;

  @Prop({
    default: 'queued',
    enum: ['queued', 'running', 'completed', 'failed', 'waiting_approval', 'cancelled'],
  })
  status: ExecutionStatus;

  @Prop({ type: Object, default: {} })
  inputPayload: Record<string, any>;

  @Prop({ type: Object, default: {} })
  outputPayload: Record<string, any>;

  @Prop({ type: Array, default: [] })
  steps: WorkflowStepRun[];

  @Prop({
    type: Object,
    default: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
  })
  aiUsage: AIUsageStats;

  @Prop({ type: Object, default: null })
  approvalDetails?: ApprovalDetails;

  @Prop({ default: null })
  startedAt?: Date;

  @Prop({ default: null })
  finishedAt?: Date;

  @Prop({ default: 0 })
  durationMs: number;

  @Prop({ default: null })
  error?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkflowExecutionSchema = SchemaFactory.createForClass(WorkflowExecution);

WorkflowExecutionSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ workflowId: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ status: 1 });
WorkflowExecutionSchema.index({ 'approvalDetails.approvalToken': 1 }, { sparse: true });
