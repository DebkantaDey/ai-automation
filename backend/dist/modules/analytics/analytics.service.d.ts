import { Model, Types } from 'mongoose';
import { WorkflowDocument } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from '../workflows/schemas/workflow-execution.schema';
import { UsageRecordDocument } from '../billing/schemas/usage-record.schema';
import { SubscriptionLimitService } from '../billing/services/subscription-limit.service';
export declare class AnalyticsService {
    private readonly workflowModel;
    private readonly executionModel;
    private readonly usageModel;
    private readonly limitService;
    private readonly logger;
    constructor(workflowModel: Model<WorkflowDocument>, executionModel: Model<WorkflowExecutionDocument>, usageModel: Model<UsageRecordDocument>, limitService: SubscriptionLimitService);
    private toObjectId;
    getDashboardAnalytics(organizationId: string, workspaceId: string): Promise<{
        business: {
            totalWorkflows: number;
            activeWorkflows: number;
            totalExecutions: number;
            completedExecutions: number;
            failedExecutions: number;
            waitingApprovalExecutions: number;
            successRate: number;
            failureRate: number;
        };
        ai: {
            aiExecutions: number;
            aiPromptTokens: number;
            aiCompletionTokens: number;
            aiTotalTokens: number;
            estimatedCostUsd: number;
        };
        quotas: {
            workflows: {
                current: number;
                limit: number;
                percent: number;
            };
            monthlyExecutions: {
                current: number;
                limit: number;
                percent: number;
            };
            monthlyAiExecutions: {
                current: number;
                limit: number;
                percent: number;
            };
            storageMb: {
                usedMb: number;
                limitMb: number;
            };
        };
        plan: Partial<import("../billing/schemas/plan.schema").Plan>;
        recentExecutions: (import("mongoose").Document<unknown, {}, WorkflowExecutionDocument, {}, {}> & WorkflowExecution & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
}
