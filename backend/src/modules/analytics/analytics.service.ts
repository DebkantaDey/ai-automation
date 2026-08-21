import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workflow, WorkflowDocument } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from '../workflows/schemas/workflow-execution.schema';
import { UsageRecord, UsageRecordDocument } from '../billing/schemas/usage-record.schema';
import { SubscriptionLimitService } from '../billing/services/subscription-limit.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Workflow.name) private readonly workflowModel: Model<WorkflowDocument>,
    @InjectModel(WorkflowExecution.name) private readonly executionModel: Model<WorkflowExecutionDocument>,
    @InjectModel(UsageRecord.name) private readonly usageModel: Model<UsageRecordDocument>,
    private readonly limitService: SubscriptionLimitService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async getDashboardAnalytics(organizationId: string, workspaceId: string) {
    const orgObjId = this.toObjectId(organizationId);
    const wsObjId = this.toObjectId(workspaceId);

    const [
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      completedExecutions,
      failedExecutions,
      waitingApprovalExecutions,
      recentExecutions,
      planLimitsOverview,
      currentUsageRecord,
    ] = await Promise.all([
      this.workflowModel.countDocuments({ organizationId: orgObjId, isDeleted: false }),
      this.workflowModel.countDocuments({ organizationId: orgObjId, isDeleted: false, status: 'active' }),
      this.executionModel.countDocuments({ organizationId: orgObjId }),
      this.executionModel.countDocuments({ organizationId: orgObjId, status: 'completed' }),
      this.executionModel.countDocuments({ organizationId: orgObjId, status: 'failed' }),
      this.executionModel.countDocuments({ organizationId: orgObjId, status: 'waiting_approval' }),
      this.executionModel
        .find({ organizationId: orgObjId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('workflowId', 'name')
        .exec(),
      this.limitService.getPlanLimits(organizationId),
      this.usageModel.findOne({ organizationId: orgObjId }).sort({ billingPeriod: -1 }).exec(),
    ]);

    const successRate = totalExecutions > 0
      ? parseFloat(((completedExecutions / totalExecutions) * 100).toFixed(1))
      : 100;
    const failureRate = totalExecutions > 0
      ? parseFloat(((failedExecutions / totalExecutions) * 100).toFixed(1))
      : 0;

    const aiMetrics = {
      aiExecutions: currentUsageRecord?.aiExecutions || 0,
      aiPromptTokens: currentUsageRecord?.aiPromptTokens || 0,
      aiCompletionTokens: currentUsageRecord?.aiCompletionTokens || 0,
      aiTotalTokens: currentUsageRecord?.aiTotalTokens || 0,
      estimatedCostUsd: parseFloat((currentUsageRecord?.aiCostUsd || 0).toFixed(4)),
    };

    const quotaUsage = {
      workflows: {
        current: totalWorkflows,
        limit: planLimitsOverview.limits.maxWorkflows,
        percent: planLimitsOverview.limits.maxWorkflows === -1 ? 0 : Math.min(100, Math.round((totalWorkflows / (planLimitsOverview.limits.maxWorkflows || 1)) * 100)),
      },
      monthlyExecutions: {
        current: currentUsageRecord?.workflowExecutions || totalExecutions,
        limit: planLimitsOverview.limits.maxWorkflowExecutions,
        percent: planLimitsOverview.limits.maxWorkflowExecutions === -1 ? 0 : Math.min(100, Math.round(((currentUsageRecord?.workflowExecutions || 0) / (planLimitsOverview.limits.maxWorkflowExecutions || 1)) * 100)),
      },
      monthlyAiExecutions: {
        current: currentUsageRecord?.aiExecutions || 0,
        limit: planLimitsOverview.limits.maxAIExecutions,
        percent: planLimitsOverview.limits.maxAIExecutions === -1 ? 0 : Math.min(100, Math.round(((currentUsageRecord?.aiExecutions || 0) / (planLimitsOverview.limits.maxAIExecutions || 1)) * 100)),
      },
      storageMb: {
        usedMb: parseFloat(((currentUsageRecord?.storageBytes || 0) / (1024 * 1024)).toFixed(2)),
        limitMb: planLimitsOverview.limits.maxStorage,
      },
    };

    return {
      business: {
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        completedExecutions,
        failedExecutions,
        waitingApprovalExecutions,
        successRate,
        failureRate,
      },
      ai: aiMetrics,
      quotas: quotaUsage,
      plan: planLimitsOverview.plan,
      recentExecutions,
    };
  }
}
