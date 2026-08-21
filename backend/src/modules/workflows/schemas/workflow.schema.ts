import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export interface WorkflowNode {
  id: string;
  type:
    | 'trigger'
    | 'http_request'
    | 'condition_branch'
    | 'transformer_code'
    | 'ai_generate'
    | 'ai_agent_tool'
    | 'human_approval'
    | 'delay'
    | string;
  label: string;
  position?: { x: number; y: number };
  data?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface WorkflowSettings {
  maxExecutionTimeMs: number;
  retryOnFailure: boolean;
  maxRetries: number;
  requireHumanApproval: boolean;
}

export type WorkflowDocument = Workflow & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Workflow {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true, default: '' })
  description?: string;

  @Prop({
    default: 'manual',
    enum: ['manual', 'webhook', 'schedule', 'app_event'],
    index: true,
  })
  triggerType: string;

  @Prop({ type: Object, default: {} })
  triggerConfig: Record<string, any>;

  @Prop({ required: false, trim: true })
  webhookId?: string;

  @Prop({ type: Array, default: [] })
  nodes: WorkflowNode[];

  @Prop({ type: Array, default: [] })
  edges: WorkflowEdge[];

  @Prop({
    default: 'draft',
    enum: ['draft', 'active', 'paused'],
    index: true,
  })
  status: string;

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: 0 })
  publishedVersion: number;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({
    type: {
      maxExecutionTimeMs: { type: Number, default: 300000 }, // 5 minutes
      retryOnFailure: { type: Boolean, default: true },
      maxRetries: { type: Number, default: 3 },
      requireHumanApproval: { type: Boolean, default: false },
    },
    default: {},
  })
  settings: WorkflowSettings;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy?: Types.ObjectId;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);

WorkflowSchema.index({ organizationId: 1, workspaceId: 1, isDeleted: 1 });
WorkflowSchema.index({ webhookId: 1 }, { sparse: true });
