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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const plan_schema_1 = require("../schemas/plan.schema");
const subscription_schema_1 = require("../schemas/subscription.schema");
const organization_schema_1 = require("../../organizations/schemas/organization.schema");
const user_schema_1 = require("../../users/schemas/user.schema");
const billing_service_1 = require("../../../integrations/billing/billing.service");
const subscription_limit_service_1 = require("./subscription-limit.service");
const subscription_status_service_1 = require("./subscription-status.service");
const subscription_events_service_1 = require("./subscription-events.service");
const default_plans_1 = require("../constants/default-plans");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    planModel;
    subscriptionModel;
    orgModel;
    userModel;
    configService;
    billingService;
    limitService;
    statusService;
    eventsService;
    logger = new common_1.Logger(SubscriptionsService_1.name);
    constructor(planModel, subscriptionModel, orgModel, userModel, configService, billingService, limitService, statusService, eventsService) {
        this.planModel = planModel;
        this.subscriptionModel = subscriptionModel;
        this.orgModel = orgModel;
        this.userModel = userModel;
        this.configService = configService;
        this.billingService = billingService;
        this.limitService = limitService;
        this.statusService = statusService;
        this.eventsService = eventsService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async onModuleInit() {
        await this.ensureDefaultPlans();
    }
    async ensureDefaultPlans() {
        for (const planDef of default_plans_1.DEFAULT_PLANS) {
            const existing = await this.planModel.findOne({ slug: planDef.slug });
            if (!existing) {
                const plan = new this.planModel({
                    ...planDef,
                    isActive: true,
                    isPublic: true,
                });
                await plan.save();
                this.logger.log(`Initialized default billing plan: [${planDef.name}]`);
            }
        }
    }
    async getPublicPlans() {
        return this.planModel
            .find({ isActive: true, isPublic: true })
            .sort({ monthlyPrice: 1 })
            .exec();
    }
    async getPlanBySlug(slug) {
        const plan = await this.planModel.findOne({ slug: slug.toLowerCase() });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with slug '${slug}' not found`);
        }
        return plan;
    }
    async ensureTrialSubscription(organizationId, userId) {
        const existing = await this.subscriptionModel
            .findOne({ organizationId: this.toObjectId(organizationId) })
            .populate('planId')
            .exec();
        if (existing) {
            return existing;
        }
        const billingConfig = this.configService.get('billing');
        const trialEnabled = billingConfig?.trialEnabled ?? true;
        const trialDays = billingConfig?.trialDurationDays ?? 7;
        const trialPlanSlug = billingConfig?.trialPlan ?? 'starter';
        const now = new Date();
        if (trialEnabled) {
            const trialPlan = await this.getPlanBySlug(trialPlanSlug);
            const trialEnd = new Date(now.getTime() + trialDays * 24 * 3600 * 1000);
            const sub = new this.subscriptionModel({
                organizationId: this.toObjectId(organizationId),
                planId: trialPlan._id,
                provider: 'manual',
                status: 'trialing',
                billingInterval: 'monthly',
                trialStart: now,
                trialEnd,
                currentPeriodStart: now,
                currentPeriodEnd: trialEnd,
                cancelAtPeriodEnd: false,
            });
            await sub.save();
            await this.eventsService.emit({
                organizationId: organizationId.toString(),
                subscriptionId: sub._id.toString(),
                eventType: 'subscription.trial_started',
                currentStatus: 'trialing',
                planSlug: trialPlan.slug,
                timestamp: now,
                metadata: { trialDurationDays: trialDays, trialEnd },
            });
            return (await this.subscriptionModel.findById(sub._id).populate('planId').exec());
        }
        const freePlan = await this.getPlanBySlug('free');
        const sub = new this.subscriptionModel({
            organizationId: this.toObjectId(organizationId),
            planId: freePlan._id,
            provider: 'manual',
            status: 'active',
            billingInterval: 'monthly',
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 3600 * 1000),
            cancelAtPeriodEnd: false,
        });
        await sub.save();
        return (await this.subscriptionModel.findById(sub._id).populate('planId').exec());
    }
    async getOrganizationSubscription(organizationId) {
        let sub = await this.subscriptionModel
            .findOne({ organizationId: this.toObjectId(organizationId) })
            .populate('planId')
            .exec();
        if (!sub) {
            sub = await this.ensureTrialSubscription(organizationId);
        }
        const computedStatus = this.statusService.getSubscriptionStatus(sub);
        const usageOverview = await this.limitService.getUsageOverview(organizationId);
        return {
            subscription: {
                id: sub?._id,
                organizationId: sub?.organizationId,
                status: sub?.status,
                provider: sub?.provider,
                billingInterval: sub?.billingInterval,
                currentPeriodStart: sub?.currentPeriodStart,
                currentPeriodEnd: sub?.currentPeriodEnd,
                trialStart: sub?.trialStart,
                trialEnd: sub?.trialEnd,
                cancelAtPeriodEnd: sub?.cancelAtPeriodEnd,
                cancelledAt: sub?.cancelledAt,
                plan: sub?.planId,
            },
            statusDetails: computedStatus,
            usage: usageOverview.usage,
        };
    }
    async createCheckout(organizationId, userId, dto) {
        const targetPlan = await this.getPlanBySlug(dto.planSlug);
        const org = await this.orgModel.findById(this.toObjectId(organizationId));
        const user = await this.userModel.findById(this.toObjectId(userId));
        if (!org || !user) {
            throw new common_1.NotFoundException('Organization or user not found');
        }
        if (targetPlan.slug === 'free' || targetPlan.monthlyPrice === 0) {
            return this.changePlan(organizationId, userId, {
                planSlug: 'free',
                billingInterval: dto.billingInterval,
            });
        }
        const providerName = dto.provider || 'stripe';
        const priceId = dto.billingInterval === 'yearly'
            ? targetPlan.providerReferences?.[providerName]?.yearlyPriceId || `price_${targetPlan.slug}_yearly`
            : targetPlan.providerReferences?.[providerName]?.monthlyPriceId || `price_${targetPlan.slug}_monthly`;
        const successUrl = dto.successUrl || `http://localhost:3000/${org.slug}/default/settings/billing?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = dto.cancelUrl || `http://localhost:3000/${org.slug}/default/settings/billing?cancelled=true`;
        const checkout = await this.billingService.createSubscriptionCheckout(`cust_${org._id}`, priceId, successUrl, cancelUrl, providerName);
        return {
            sessionId: checkout.sessionId,
            checkoutUrl: checkout.url,
            plan: targetPlan.name,
            interval: dto.billingInterval,
            provider: providerName,
        };
    }
    async changePlan(organizationId, userId, dto) {
        const targetPlan = await this.getPlanBySlug(dto.planSlug);
        const org = await this.orgModel.findById(this.toObjectId(organizationId));
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const sub = await this.subscriptionModel.findOne({ organizationId: this.toObjectId(organizationId) });
        const currentStatus = sub?.status || 'trialing';
        this.statusService.validateTransition(currentStatus, 'active');
        const currentPeriodEnd = new Date(Date.now() + (dto.billingInterval === 'yearly' ? 365 : 30) * 24 * 3600 * 1000);
        const updatedSub = await this.subscriptionModel.findOneAndUpdate({ organizationId: this.toObjectId(organizationId) }, {
            $set: {
                planId: targetPlan._id,
                billingInterval: dto.billingInterval,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd,
                cancelAtPeriodEnd: false,
                cancelledAt: null,
            },
        }, { upsert: true, new: true }).populate('planId');
        org.plan = targetPlan.slug;
        await org.save();
        await this.eventsService.emit({
            organizationId: organizationId.toString(),
            subscriptionId: updatedSub._id.toString(),
            eventType: 'subscription.plan_changed',
            previousStatus: currentStatus,
            currentStatus: 'active',
            planSlug: targetPlan.slug,
            timestamp: new Date(),
        });
        return {
            success: true,
            message: `Organization subscription updated to ${targetPlan.name} (${dto.billingInterval})`,
            subscription: updatedSub,
        };
    }
    async cancelSubscription(organizationId, userId) {
        const sub = await this.subscriptionModel.findOne({
            organizationId: this.toObjectId(organizationId),
        });
        if (!sub) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        this.statusService.validateTransition(sub.status, 'cancelled');
        sub.cancelAtPeriodEnd = true;
        sub.cancelledAt = new Date();
        await sub.save();
        await this.eventsService.emit({
            organizationId: organizationId.toString(),
            subscriptionId: sub._id.toString(),
            eventType: 'subscription.cancelled',
            currentStatus: sub.status,
            planSlug: 'active',
            timestamp: new Date(),
        });
        return {
            success: true,
            message: 'Subscription scheduled for cancellation at the end of the current billing period',
            currentPeriodEnd: sub.currentPeriodEnd,
        };
    }
    async reactivateSubscription(organizationId, userId) {
        const sub = await this.subscriptionModel.findOne({
            organizationId: this.toObjectId(organizationId),
        });
        if (!sub) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        this.statusService.validateTransition(sub.status, 'active');
        sub.cancelAtPeriodEnd = false;
        sub.cancelledAt = undefined;
        await sub.save();
        await this.eventsService.emit({
            organizationId: organizationId.toString(),
            subscriptionId: sub._id.toString(),
            eventType: 'subscription.renewed',
            currentStatus: sub.status,
            planSlug: 'active',
            timestamp: new Date(),
        });
        return {
            success: true,
            message: 'Subscription successfully reactivated and renewed',
            currentPeriodEnd: sub.currentPeriodEnd,
        };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(plan_schema_1.Plan.name)),
    __param(1, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __param(2, (0, mongoose_1.InjectModel)(organization_schema_1.Organization.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService,
        billing_service_1.BillingService,
        subscription_limit_service_1.SubscriptionLimitService,
        subscription_status_service_1.SubscriptionStatusService,
        subscription_events_service_1.SubscriptionEventsService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map