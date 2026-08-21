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
var SubscriptionStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ALLOWED_TRANSITIONS = {
    trialing: ['active', 'expired'],
    active: ['past_due', 'cancelled', 'paused'],
    past_due: ['active', 'cancelled', 'expired'],
    cancelled: ['active'],
    paused: ['active', 'cancelled'],
    expired: ['active'],
    incomplete: ['active', 'cancelled', 'expired'],
};
let SubscriptionStatusService = SubscriptionStatusService_1 = class SubscriptionStatusService {
    configService;
    logger = new common_1.Logger(SubscriptionStatusService_1.name);
    gracePeriodDays;
    constructor(configService) {
        this.configService = configService;
        const config = this.configService.get('billing');
        this.gracePeriodDays = config?.gracePeriodDays || 3;
    }
    getSubscriptionStatus(subscription, now = new Date()) {
        const rawStatus = (subscription?.status || 'trialing');
        const trialEnd = subscription?.trialEnd ? new Date(subscription.trialEnd) : undefined;
        const currentPeriodEnd = subscription?.currentPeriodEnd
            ? new Date(subscription.currentPeriodEnd)
            : new Date(now.getTime() + 7 * 24 * 3600 * 1000);
        let state = 'paid_active';
        let isTrial = false;
        let isTrialExpired = false;
        let trialRemainingDays = 0;
        let trialRemainingHours = 0;
        let isInGracePeriod = false;
        let graceRemainingDays = 0;
        let canPerformMutations = true;
        if (rawStatus === 'trialing' && trialEnd) {
            isTrial = true;
            const diffMs = trialEnd.getTime() - now.getTime();
            if (diffMs <= 0) {
                state = 'trial_expired';
                isTrialExpired = true;
                canPerformMutations = false;
            }
            else {
                trialRemainingHours = Math.max(0, Math.ceil(diffMs / (1000 * 3600)));
                trialRemainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 3600 * 24)));
                if (trialRemainingDays <= 2) {
                    state = 'trial_expiring_soon';
                }
                else {
                    state = 'trial_active';
                }
            }
        }
        else if (rawStatus === 'active') {
            state = 'paid_active';
            canPerformMutations = true;
        }
        else if (rawStatus === 'past_due') {
            const graceEnd = new Date(currentPeriodEnd.getTime() + this.gracePeriodDays * 24 * 3600 * 1000);
            const diffGraceMs = graceEnd.getTime() - now.getTime();
            if (diffGraceMs > 0) {
                state = 'past_due_grace';
                isInGracePeriod = true;
                graceRemainingDays = Math.max(0, Math.ceil(diffGraceMs / (1000 * 3600 * 24)));
                canPerformMutations = true;
            }
            else {
                state = 'past_due_restricted';
                canPerformMutations = false;
            }
        }
        else if (rawStatus === 'cancelled') {
            state = 'cancelled';
            canPerformMutations = false;
        }
        else if (rawStatus === 'paused') {
            state = 'paused';
            canPerformMutations = false;
        }
        else if (rawStatus === 'expired') {
            state = 'expired';
            isTrialExpired = true;
            canPerformMutations = false;
        }
        return {
            state,
            rawStatus,
            isTrial,
            isTrialExpired,
            trialRemainingDays,
            trialRemainingHours,
            isInGracePeriod,
            graceRemainingDays,
            canAccessPlatform: true,
            canPerformMutations,
            isReadOnly: !canPerformMutations,
            currentPeriodEnd,
            trialEnd,
        };
    }
    validateTransition(fromStatus = 'trialing', toStatus = 'active') {
        const from = (fromStatus || 'trialing').toLowerCase();
        const to = (toStatus || 'active').toLowerCase();
        if (from === to) {
            return true;
        }
        const allowed = ALLOWED_TRANSITIONS[from];
        if (!allowed || !allowed.includes(to)) {
            throw new common_1.BadRequestException(`Invalid subscription state transition from '${from}' to '${to}'. Allowed: [${(allowed || []).join(', ')}]`);
        }
        return true;
    }
};
exports.SubscriptionStatusService = SubscriptionStatusService;
exports.SubscriptionStatusService = SubscriptionStatusService = SubscriptionStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SubscriptionStatusService);
//# sourceMappingURL=subscription-status.service.js.map