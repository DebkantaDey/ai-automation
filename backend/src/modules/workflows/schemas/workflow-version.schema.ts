import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { WorkflowNode, WorkflowEdge, WorkflowSettings } from './workflow.schema';

export type WorkflowVersionDocument = WorkflowVersion & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class WorkflowVersion {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workflow', required: true, index: true })
  workflowId: Types.ObjectId;

  @Prop({ required: true })
  version: number;

  @Prop({ type: Array, required: true })
  nodes: WorkflowNode[];

  @Prop({ type: Array, required: true })
  edges: WorkflowEdge[];

  @Prop({ type: Object, default: {} })
  triggerConfig: Record<string, any>;

  @Prop({ type: Object, default: {} })
  settings: WorkflowSettings;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  publishedBy?: Types.ObjectId;

  @Prop({ default: '' })
  changelog?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkflowVersionSchema = SchemaFactory.createForClass(WorkflowVersion);

WorkflowVersionSchema.index({ workflowId: 1, version: 1 }, { unique: true });
WorkflowVersionSchema.index({ organizationId: 1, workspaceId: 1 });
