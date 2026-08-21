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
var UsageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const usage_record_schema_1 = require("../schemas/usage-record.schema");
const subscription_limit_service_1 = require("./subscription-limit.service");
let UsageService = UsageService_1 = class UsageService {
    usageModel;
    limitService;
    logger = new common_1.Logger(UsageService_1.name);
    constructor(usageModel, limitService) {
        this.usageModel = usageModel;
        this.limitService = limitService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    getCurrentPeriodKey() {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
    async getOrCreatePeriodUsage(organizationId) {
        const period = this.getCurrentPeriodKey();
        const orgObjId = this.toObjectId(organizationId);
        let record = await this.usageModel.findOne({
            organizationId: orgObjId,
            billingPeriod: period,
        });
        if (!record) {
            record = await this.usageModel.findOneAndUpdate({ organizationId: orgObjId, billingPeriod: period }, {
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
            }, { upsert: true, new: true });
        }
        return record;
    }
    async recordWorkflowExecution(organizationId) {
        const period = this.getCurrentPeriodKey();
        const orgObjId = this.toObjectId(organizationId);
        await this.usageModel.updateOne({ organizationId: orgObjId, billingPeriod: period }, { $inc: { workflowExecutions: 1 } }, { upsert: true });
    }
    async recordAIUsage(organizationId, stats) {
        const period = this.getCurrentPeriodKey();
        const orgObjId = this.toObjectId(organizationId);
        const promptTokens = stats.promptTokens || 0;
        const completionTokens = stats.completionTokens || 0;
        const totalTokens = stats.totalTokens || promptTokens + completionTokens;
        const costUsd = stats.costUsd || (totalTokens / 1000) * 0.002;
        await this.usageModel.updateOne({ organizationId: orgObjId, billingPeriod: period }, {
            $inc: {
                aiExecutions: 1,
                aiPromptTokens: promptTokens,
                aiCompletionTokens: completionTokens,
                aiTotalTokens: totalTokens,
                aiCostUsd: costUsd,
            },
        }, { upsert: true });
    }
    async recordAPIRequest(organizationId) {
        const period = this.getCurrentPeriodKey();
        const orgObjId = this.toObjectId(organizationId);
        await this.usageModel.updateOne({ organizationId: orgObjId, billingPeriod: period }, { $inc: { apiRequests: 1 } }, { upsert: true });
    }
    async recordStorage(organizationId, deltaBytes) {
        const period = this.getCurrentPeriodKey();
        const orgObjId = this.toObjectId(organizationId);
        await this.usageModel.updateOne({ organizationId: orgObjId, billingPeriod: period }, { $inc: { storageBytes: deltaBytes } }, { upsert: true });
    }
    async recordDocuments(organizationId, deltaCount) {
        const period = this.getCurrentPeriodKey();
        const orgObjId = this.toObjectId(organizationId);
        await this.usageModel.updateOne({ organizationId: orgObjId, billingPeriod: period }, { $inc: { documentsCount: deltaCount } }, { upsert: true });
    }
    async recordIntegrationsCount(organizationId, count) {
        const period = this.getCurrentPeriodKey();
        const orgObjId = this.toObjectId(organizationId);
        await this.usageModel.updateOne({ organizationId: orgObjId, billingPeriod: period }, { $set: { integrationsCount: count } }, { upsert: true });
    }
    async checkLimit(organizationId, metric) {
        const { plan, limits } = await this.limitService.getPlanLimits(organizationId);
        const usage = await this.getOrCreatePeriodUsage(organizationId);
        switch (metric) {
            case 'workflowExecutions':
                if (limits.maxWorkflowExecutions !== -1 && usage.workflowExecutions >= limits.maxWorkflowExecutions) {
                    throw new common_1.ForbiddenException(`Monthly workflow execution quota exceeded (${usage.workflowExecutions}/${limits.maxWorkflowExecutions}). Upgrade your subscription plan.`);
                }
                break;
            case 'aiExecutions':
                if (limits.maxAIExecutions !== -1 && usage.aiExecutions >= limits.maxAIExecutions) {
                    throw new common_1.ForbiddenException(`Monthly AI execution quota exceeded (${usage.aiExecutions}/${limits.maxAIExecutions}). Upgrade your plan.`);
                }
                break;
            case 'apiRequests':
                if (limits.maxAPIRequests !== -1 && usage.apiRequests >= limits.maxAPIRequests) {
                    throw new common_1.ForbiddenException(`Monthly API request quota exceeded (${usage.apiRequests}/${limits.maxAPIRequests}). Upgrade your plan.`);
                }
                break;
            case 'storage':
                const maxBytes = (limits.maxStorage || 500) * 1024 * 1024;
                if (limits.maxStorage !== -1 && usage.storageBytes >= maxBytes) {
                    throw new common_1.ForbiddenException(`Storage limit exceeded (${(usage.storageBytes / (1024 * 1024)).toFixed(1)}MB / ${limits.maxStorage}MB). Upgrade your plan.`);
                }
                break;
        }
    }
    async getUsageOverview(organizationId) {
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
};
exports.UsageService = UsageService;
exports.UsageService = UsageService = UsageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(usage_record_schema_1.UsageRecord.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        subscription_limit_service_1.SubscriptionLimitService])
], UsageService);
//# sourceMappingURL=usage.service.js.map