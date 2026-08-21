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
var SubscriptionAccessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionAccessService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_schema_1 = require("../schemas/subscription.schema");
const subscription_status_service_1 = require("./subscription-status.service");
const subscription_limit_service_1 = require("./subscription-limit.service");
let SubscriptionAccessService = SubscriptionAccessService_1 = class SubscriptionAccessService {
    subscriptionModel;
    statusService;
    limitService;
    logger = new common_1.Logger(SubscriptionAccessService_1.name);
    constructor(subscriptionModel, statusService, limitService) {
        this.subscriptionModel = subscriptionModel;
        this.statusService = statusService;
        this.limitService = limitService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async checkMutationAccess(organizationId) {
        const sub = await this.subscriptionModel.findOne({
            organizationId: this.toObjectId(organizationId),
        });
        if (!sub) {
            return true;
        }
        const computed = this.statusService.getSubscriptionStatus(sub);
        if (!computed.canPerformMutations) {
            if (computed.isTrialExpired) {
                throw new common_1.ForbiddenException('Subscription Required: Your free trial has expired. Please upgrade your subscription to continue creating and executing automations.');
            }
            if (computed.state === 'past_due_restricted') {
                throw new common_1.ForbiddenException('Payment Required: Your subscription is past due and the grace period has ended. Please update your payment method to resume operations.');
            }
            if (computed.state === 'cancelled') {
                throw new common_1.ForbiddenException('Subscription Cancelled: Please reactivate your subscription to resume automated operations.');
            }
            throw new common_1.ForbiddenException('Subscription Inactive: Please renew your subscription to access this feature.');
        }
        return true;
    }
    async canCreateWorkflow(organizationId, currentCount = 0) {
        await this.checkMutationAccess(organizationId);
        return this.limitService.canCreateWorkflow(organizationId, currentCount);
    }
    async canExecuteWorkflow(organizationId, currentCount = 0) {
        await this.checkMutationAccess(organizationId);
        return this.limitService.canExecuteWorkflow(organizationId, currentCount);
    }
    async canUseAI(organizationId, tokensRequested = 1, currentTokens = 0) {
        await this.checkMutationAccess(organizationId);
        return this.limitService.canUseAI(organizationId, tokensRequested, currentTokens);
    }
    async canConnectIntegration(organizationId, currentCount = 0) {
        await this.checkMutationAccess(organizationId);
        return this.limitService.canCreateIntegration(organizationId, currentCount);
    }
    async canInviteMembers(organizationId) {
        await this.checkMutationAccess(organizationId);
        return this.limitService.canInviteMember(organizationId);
    }
    async canCreateWorkspace(organizationId) {
        await this.checkMutationAccess(organizationId);
        return this.limitService.canCreateWorkspace(organizationId);
    }
};
exports.SubscriptionAccessService = SubscriptionAccessService;
exports.SubscriptionAccessService = SubscriptionAccessService = SubscriptionAccessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        subscription_status_service_1.SubscriptionStatusService,
        subscription_limit_service_1.SubscriptionLimitService])
], SubscriptionAccessService);
//# sourceMappingURL=subscription-access.service.js.map