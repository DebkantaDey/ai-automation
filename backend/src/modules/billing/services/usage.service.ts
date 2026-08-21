import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsageRecord, UsageRecordDocument } from '../schemas/usage-record.schema';
import { SubscriptionLimitService } from './subscription-limit.service';

export interface RecordAIUsageDto {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUsd?: number;
}

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    @InjectModel(UsageRecord.name) private readonly usageModel: Model<UsageRecordDocument>,
    private readonly limitService: SubscriptionLimitService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  getCurrentPeriodKey(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async getOrCreatePeriodUsage(organizationId: string): Promise<UsageRecordDocument> {
    const period = this.getCurrentPeriodKey();
    const orgObjId = this.toObjectId(organizationId);

    let record = await this.usageModel.findOne({
      organizationId: orgObjId,
      billingPeriod: period,
    });

    if (!record) {
      record = await this.usageModel.findOneAndUpdate(
        { organizationId: orgObjId, billingPeriod: period },
        {
          $setOnInsert: {
            organizationId: orgObjId,
            billingPeriod: period,
            workflowExecutions: 0,
            aiExecutions: 0,
            aiPromptTokens: 0,
            aiCompletionTokens: 0,
            aiTotalTokens: 0,
            aiCostUsd: 0,
            apiRequests: 0,
            storageBytes: 0,
            integrationsCount: 0,
            documentsCount: 0,
            lastResetAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );
    }

    return record;
  }

  async recordWorkflowExecution(organizationId: string): Promise<void> {
    const period = this.getCurrentPeriodKey();
    const orgObjId = this.toObjectId(organizationId);

    await this.usageModel.updateOne(
      { organizationId: orgObjId, billingPeriod: period },
      { $inc: { workflowExecutions: 1 } },
      { upsert: true },
    );
  }

  async recordAIUsage(organizationId: string, stats: RecordAIUsageDto): Promise<void> {
    const period = this.getCurrentPeriodKey();
    const orgObjId = this.toObjectId(organizationId);

    const promptTokens = stats.promptTokens || 0;
    const completionTokens = stats.completionTokens || 0;
    const totalTokens = stats.totalTokens || promptTokens + completionTokens;
    const costUsd = stats.costUsd || (totalTokens / 1000) * 0.002;

    await this.usageModel.updateOne(
      { organizationId: orgObjId, billingPeriod: period },
      {
        $inc: {
          aiExecutions: 1,
          aiPromptTokens: promptTokens,
          aiCompletionTokens: completionTokens,
          aiTotalTokens: totalTokens,
          aiCostUsd: costUsd,
        },
      },
      { upsert: true },
    );
  }

  async recordAPIRequest(organizationId: string): Promise<void> {
    const period = this.getCurrentPeriodKey();
    const orgObjId = this.toObjectId(organizationId);

    await this.usageModel.updateOne(
      { organizationId: orgObjId, billingPeriod: period },
      { $inc: { apiRequests: 1 } },
      { upsert: true },
    );
  }

  async recordStorage(organizationId: string, deltaBytes: number): Promise<void> {
    const period = this.getCurrentPeriodKey();
    const orgObjId = this.toObjectId(organizationId);

    await this.usageModel.updateOne(
      { organizationId: orgObjId, billingPeriod: period },
      { $inc: { storageBytes: deltaBytes } },
      { upsert: true },
    );
  }

  async recordDocuments(organizationId: string, deltaCount: number): Promise<void> {
    const period = this.getCurrentPeriodKey();
    const orgObjId = this.toObjectId(organizationId);

    await this.usageModel.updateOne(
      { organizationId: orgObjId, billingPeriod: period },
      { $inc: { documentsCount: deltaCount } },
      { upsert: true },
    );
  }

  async recordIntegrationsCount(organizationId: string, count: number): Promise<void> {
    const period = this.getCurrentPeriodKey();
    const orgObjId = this.toObjectId(organizationId);

    await this.usageModel.updateOne(
      { organizationId: orgObjId, billingPeriod: period },
      { $set: { integrationsCount: count } },
      { upsert: true },
    );
  }

  async checkLimit(organizationId: string, metric: 'workflowExecutions' | 'aiExecutions' | 'apiRequests' | 'storage'): Promise<void> {
    const { plan, limits } = await this.limitService.getPlanLimits(organizationId);
    const usage = await this.getOrCreatePeriodUsage(organizationId);

    switch (metric) {
      case 'workflowExecutions':
        if (limits.maxWorkflowExecutions !== -1 && usage.workflowExecutions >= limits.maxWorkflowExecutions) {
          throw new ForbiddenException(
            `Monthly workflow execution quota exceeded (${usage.workflowExecutions}/${limits.maxWorkflowExecutions}). Upgrade your subscription plan.`,
          );
        }
        break;
      case 'aiExecutions':
        if (limits.maxAIExecutions !== -1 && usage.aiExecutions >= limits.maxAIExecutions) {
          throw new ForbiddenException(
            `Monthly AI execution quota exceeded (${usage.aiExecutions}/${limits.maxAIExecutions}). Upgrade your plan.`,
          );
        }
        break;
      case 'apiRequests':
        if (limits.maxAPIRequests !== -1 && usage.apiRequests >= limits.maxAPIRequests) {
          throw new ForbiddenException(
            `Monthly API request quota exceeded (${usage.apiRequests}/${limits.maxAPIRequests}). Upgrade your plan.`,
          );
        }
        break;
      case 'storage':
        const maxBytes = (limits.maxStorage || 500) * 1024 * 1024;
        if (limits.maxStorage !== -1 && usage.storageBytes >= maxBytes) {
          throw new ForbiddenException(
            `Storage limit exceeded (${(usage.storageBytes / (1024 * 1024)).toFixed(1)}MB / ${limits.maxStorage}MB). Upgrade your plan.`,
          );
        }
        break;
    }
  }

  async getUsageOverview(organizationId: string) {
    const usage = await this.getOrCreatePeriodUsage(organizationId);
    const { plan, limits } = await this.limitService.getPlanLimits(organizationId);

    return {
      period: usage.billingPeriod,
      metrics: {
        workflowExecutions: {
          used: usage.workflowExecutions,
          limit: limits.maxWorkflowExecutions ?? 100,
          percent: limits.maxWorkflowExecutions === -1 ? 0 : Math.min(100, Math.round((usage.workflowExecutions / (limits.maxWorkflowExecutions || 1)) * 100)),
        },
        aiExecutions: {
          used: usage.aiExecutions,
          limit: limits.maxAIExecutions ?? 50,
          percent: limits.maxAIExecutions === -1 ? 0 : Math.min(100, Math.round((usage.aiExecutions / (limits.maxAIExecutions || 1)) * 100)),
        },
        aiTokens: {
          total: usage.aiTotalTokens,
          prompt: usage.aiPromptTokens,
          completion: usage.aiCompletionTokens,
          costUsd: usage.aiCostUsd,
        },
        apiRequests: {
          used: usage.apiRequests,
          limit: limits.maxAPIRequests ?? 1000,
          percent: limits.maxAPIRequests === -1 ? 0 : Math.min(100, Math.round((usage.apiRequests / (limits.maxAPIRequests || 1)) * 100)),
        },
        storage: {
          usedBytes: usage.storageBytes,
          usedMb: parseFloat((usage.storageBytes / (1024 * 1024)).toFixed(2)),
          limitMb: limits.maxStorage ?? 500,
        },
        integrations: {
          used: usage.integrationsCount,
          limit: limits.maxIntegrations ?? 2,
        },
      },
      plan: {
        name: plan?.name,
        slug: plan?.slug,
      },
    };
  }
}
