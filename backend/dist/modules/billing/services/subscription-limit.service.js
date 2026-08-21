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
var SubscriptionLimitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionLimitService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_schema_1 = require("../schemas/subscription.schema");
const plan_schema_1 = require("../schemas/plan.schema");
const organization_member_schema_1 = require("../../organizations/schemas/organization-member.schema");
const workspace_schema_1 = require("../../workspaces/schemas/workspace.schema");
const default_plans_1 = require("../constants/default-plans");
let SubscriptionLimitService = SubscriptionLimitService_1 = class SubscriptionLimitService {
    subscriptionModel;
    planModel;
    memberModel;
    workspaceModel;
    logger = new common_1.Logger(SubscriptionLimitService_1.name);
    constructor(subscriptionModel, planModel, memberModel, workspaceModel) {
        this.subscriptionModel = subscriptionModel;
        this.planModel = planModel;
        this.memberModel = memberModel;
        this.workspaceModel = workspaceModel;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async getPlanLimits(organizationId) {
        const subscription = await this.subscriptionModel
            .findOne({ organizationId: this.toObjectId(organizationId), status: { $in: ['active', 'trialing'] } })
            .populate('planId')
            .exec();
        if (subscription && subscription.planId) {
            const plan = subscription.planId;
            return {
                plan: {
                    name: plan.name,
                    slug: plan.slug,
                    monthlyPrice: plan.monthlyPrice,
                    yearlyPrice: plan.yearlyPrice,
                    currency: plan.currency,
                },
                limits: plan.limits,
            };
        }
        const freePlan = default_plans_1.DEFAULT_PLANS.find((p) => p.slug === 'free') || default_plans_1.DEFAULT_PLANS[0];
        return {
            plan: {
                name: freePlan.name,
                slug: freePlan.slug,
                monthlyPrice: freePlan.monthlyPrice,
                yearlyPrice: freePlan.yearlyPrice,
                currency: freePlan.currency,
            },
            limits: freePlan.limits,
        };
    }
    async checkLimit(organizationId, limitKey, currentUsage) {
        const { plan, limits } = await this.getPlanLimits(organizationId);
        const maxAllowed = limits[limitKey];
        if (maxAllowed === -1) {
            return { allowed: true, limit: -1, current: currentUsage, plan: plan.name || 'Enterprise' };
        }
        if (currentUsage >= maxAllowed) {
            return { allowed: false, limit: maxAllowed, current: currentUsage, plan: plan.name || 'Free' };
        }
        return { allowed: true, limit: maxAllowed, current: currentUsage, plan: plan.name || 'Free' };
    }
    async canInviteMember(organizationId) {
        const memberCount = await this.memberModel.countDocuments({
            organizationId: this.toObjectId(organizationId),
            status: { $in: ['active', 'invited'] },
        });
        const check = await this.checkLimit(organizationId, 'maxUsers', memberCount);
        if (!check.allowed) {
            throw new common_1.ForbiddenException(`Team member limit reached (${check.current}/${check.limit}) for your ${check.plan} plan. Please upgrade your subscription to add more members.`);
        }
        return true;
    }
    async canCreateWorkspace(organizationId) {
        const workspaceCount = await this.workspaceModel.countDocuments({
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        });
        const check = await this.checkLimit(organizationId, 'maxWorkspaces', workspaceCount);
        if (!check.allowed) {
            throw new common_1.ForbiddenException(`Workspace limit reached (${check.current}/${check.limit}) for your ${check.plan} plan. Please upgrade your subscription to create additional workspaces.`);
        }
        return true;
    }
    async canCreateWorkflow(organizationId, currentCount = 0) {
        const check = await this.checkLimit(organizationId, 'maxWorkflows', currentCount);
        if (!check.allowed) {
            throw new common_1.ForbiddenException(`Workflow limit reached (${check.current}/${check.limit}) for your ${check.plan} plan. Upgrade to create more workflows.`);
        }
        return true;
    }
    async canCreateIntegration(organizationId, currentCount = 0) {
        const check = await this.checkLimit(organizationId, 'maxIntegrations', currentCount);
        if (!check.allowed) {
            throw new common_1.ForbiddenException(`Connected integration limit reached (${check.current}/${check.limit}) for your ${check.plan} plan.`);
        }
        return true;
    }
    async canExecuteWorkflow(organizationId, currentMonthlyExecutions = 0) {
        const check = await this.checkLimit(organizationId, 'maxWorkflowExecutions', currentMonthlyExecutions);
        if (!check.allowed) {
            throw new common_1.ForbiddenException(`Monthly workflow execution quota exceeded (${check.current}/${check.limit}) for your ${check.plan} plan.`);
        }
        return true;
    }
    async canUseAI(organizationId, tokensRequested = 1, currentTokensUsed = 0) {
        const check = await this.checkLimit(organizationId, 'maxAITokens', currentTokensUsed + tokensRequested);
        if (!check.allowed) {
            throw new common_1.ForbiddenException(`AI token usage quota exceeded for your ${check.plan} plan. Upgrade your plan for higher AI token limits.`);
        }
        return true;
    }
    async getUsageOverview(organizationId) {
        const { plan, limits } = await this.getPlanLimits(organizationId);
        const [membersCount, workspacesCount] = await Promise.all([
            this.memberModel.countDocuments({
                organizationId: this.toObjectId(organizationId),
                status: 'active',
            }),
            this.workspaceModel.countDocuments({
                organizationId: this.toObjectId(organizationId),
                isDeleted: false,
            }),
        ]);
        return {
            plan,
            usage: {
                users: { current: membersCount, limit: limits.maxUsers, percentage: limits.maxUsers === -1 ? 0 : Math.min(100, Math.round((membersCount / limits.maxUsers) * 100)) },
                workspaces: { current: workspacesCount, limit: limits.maxWorkspaces, percentage: limits.maxWorkspaces === -1 ? 0 : Math.min(100, Math.round((workspacesCount / limits.maxWorkspaces) * 100)) },
                workflows: { current: 0, limit: limits.maxWorkflows, percentage: 0 },
                executions: { current: 0, limit: limits.maxWorkflowExecutions, percentage: 0 },
                aiExecutions: { current: 0, limit: limits.maxAIExecutions, percentage: 0 },
                aiTokens: { current: 0, limit: limits.maxAITokens, percentage: 0 },
                storage: { current: 0, limit: limits.maxStorage, percentage: 0 },
            },
        };
    }
};
exports.SubscriptionLimitService = SubscriptionLimitService;
exports.SubscriptionLimitService = SubscriptionLimitService = SubscriptionLimitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __param(1, (0, mongoose_1.InjectModel)(plan_schema_1.Plan.name)),
    __param(2, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __param(3, (0, mongoose_1.InjectModel)(workspace_schema_1.Workspace.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SubscriptionLimitService);
//# sourceMappingURL=subscription-limit.service.js.map