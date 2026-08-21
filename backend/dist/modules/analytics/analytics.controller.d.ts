import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(orgId: string, wsId: string): Promise<{
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
        recentExecutions: (import("mongoose").Document<unknown, {}, import("../workflows/schemas/workflow-execution.schema").WorkflowExecutionDocument, {}, {}> & import("../workflows/schemas/workflow-execution.schema").WorkflowExecution & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
}
