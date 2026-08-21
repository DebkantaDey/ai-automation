import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface PlanLimits {
  maxUsers: number; // -1 for unlimited
  maxWorkspaces: number;
  maxWorkflows: number;
  maxIntegrations: number;
  maxWorkflowExecutions: number; // monthly
  maxAIExecutions: number;
  maxAITokens: number;
  maxStorage: number; // in MB
  maxAPIRequests: number;
  maxKnowledgeDocuments: number;
}

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Plan {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: false, trim: true, default: '' })
  description: string;

  @Prop({ required: true, default: 0 })
  monthlyPrice: number;

  @Prop({ required: true, default: 0 })
  yearlyPrice: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({
    type: {
      maxUsers: { type: Number, default: 2 },
      maxWorkspaces: { type: Number, default: 1 },
      maxWorkflows: { type: Number, default: 5 },
      maxIntegrations: { type: Number, default: 3 },
      maxWorkflowExecutions: { type: Number, default: 1000 },
      maxAIExecutions: { type: Number, default: 100 },
      maxAITokens: { type: Number, default: 100000 },
      maxStorage: { type: Number, default: 500 },
      maxAPIRequests: { type: Number, default: 5000 },
      maxKnowledgeDocuments: { type: Number, default: 10 },
    },
    default: {},
  })
  limits: PlanLimits;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: true, index: true })
  isPublic: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ type: Object, default: {} })
  providerReferences: Record<string, { monthlyPriceId?: string; yearlyPriceId?: string }>;

  createdAt: Date;
  updatedAt: Date;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
