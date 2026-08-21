import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AgentDocument = Agent & Document;

export interface AgentLimits {
  maxSteps: number; // default 10
  maxTokens: number; // default 4000
  maxToolCalls: number; // default 5
  timeoutSeconds: number; // default 60
}

export interface AgentToolConfig {
  name: string; // e.g. 'slack_post', 'sheets_append', 'gmail_send', 'http_fetch'
  description: string;
  connectionId?: string;
  enabled: boolean;
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Agent {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  instructions: string; // System prompt / persona / goal instructions

  @Prop({ default: 'openai' })
  provider: string;

  @Prop({ default: 'gpt-4o' })
  model: string;

  @Prop({ type: Array, default: [] })
  tools: AgentToolConfig[];

  @Prop({ type: Array, default: [] })
  knowledgeSources: string[];

  @Prop({ type: Object, default: { enableMemory: true, maxHistoryTurns: 10 } })
  memorySettings: Record<string, any>;

  @Prop({
    type: Object,
    default: {
      maxSteps: 10,
      maxTokens: 4000,
      maxToolCalls: 5,
      timeoutSeconds: 60,
    },
  })
  limits: AgentLimits;

  @Prop({ default: 'active', enum: ['active', 'paused', 'archived'], index: true })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

AgentSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
