"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const workflow_schema_1 = require("../workflows/schemas/workflow.schema");
const workflow_execution_schema_1 = require("../workflows/schemas/workflow-execution.schema");
const usage_record_schema_1 = require("../billing/schemas/usage-record.schema");
const subscription_limit_service_1 = require("../billing/services/subscription-limit.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    workflowModel;
    executionModel;
    usageModel;
    limitService;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(workflowModel, executionModel, usageModel, limitService) {
        this.workflowModel = workflowModel;
        this.executionModel = executionModel;
        this.usageModel = usageModel;
        this.limitService = limitService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async getDashboardAnalytics(organizationId, workspaceId) {
        const orgObjId = this.toObjectId(organizationId);
        const wsObjId = this.toObjectId(workspaceId);
        const [totalWorkflows, activeWorkflows, totalExecutions, completedExecutions, failedExecutions, waitingApprovalExecutions, recentExecutions, planLimitsOverview, currentUsageRecord,] = await Promise.all([
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(workflow_schema_1.Workflow.name)),
    __param(1, (0, mongoose_1.InjectModel)(workflow_execution_schema_1.WorkflowExecution.name)),
    __param(2, (0, mongoose_1.InjectModel)(usage_record_schema_1.UsageRecord.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        subscription_limit_service_1.SubscriptionLimitService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map