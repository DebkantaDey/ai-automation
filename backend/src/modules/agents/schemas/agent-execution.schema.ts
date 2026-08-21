import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { AIUsageStats } from '../../workflows/schemas/workflow-execution.schema';

export type AgentExecutionDocument = AgentExecution & Document;

export interface AgentStepTrace {
  stepNumber: number;
  thought: string;
  toolCall?: {
    name: string;
    input: Record<string, any>;
  };
  observation?: any;
  durationMs?: number;
  tokensUsed?: number;
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class AgentExecution {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true, index: true })
  agentId: Types.ObjectId;

  @Prop({
    default: 'queued',
    enum: ['queued', 'running', 'completed', 'failed', 'timeout'],
    index: true,
  })
  status: string;

  @Prop({ required: true })
  inputPrompt: string;

  @Prop({ default: '' })
  finalOutput?: string;

  @Prop({ type: Array, default: [] })
  steps: AgentStepTrace[];

  @Prop({
    type: Object,
    default: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
  })
  aiUsage: AIUsageStats;

  @Prop({ default: null })
  error?: string;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop({ default: null })
  finishedAt?: Date;

  @Prop({ default: 0 })
  durationMs: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  triggeredBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const AgentExecutionSchema = SchemaFactory.createForClass(AgentExecution);

AgentExecutionSchema.index({ agentId: 1, createdAt: -1 });
AgentExecutionSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
