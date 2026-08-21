import { ConfigService } from '@nestjs/config';
import { SubscriptionDocument, SubscriptionStatus } from '../schemas/subscription.schema';
export type ComputedSubscriptionState = 'trial_active' | 'trial_expiring_soon' | 'trial_expired' | 'paid_active' | 'past_due_grace' | 'past_due_restricted' | 'cancelled' | 'paused' | 'expired';
export interface ComputedSubscriptionStatusResult {
    state: ComputedSubscriptionState;
    rawStatus: SubscriptionStatus;
    isTrial: boolean;
    isTrialExpired: boolean;
    trialRemainingDays: number;
    trialRemainingHours: number;
    isInGracePeriod: boolean;
    graceRemainingDays: number;
    canAccessPlatform: boolean;
    canPerformMutations: boolean;
    isReadOnly: boolean;
    currentPeriodEnd: Date;
    trialEnd?: Date;
}
export declare class SubscriptionStatusService {
    private readonly configService;
    private readonly logger;
    private readonly gracePeriodDays;
    constructor(configService: ConfigService);
    getSubscriptionStatus(subscription: Partial<SubscriptionDocument> | any, now?: Date): ComputedSubscriptionStatusResult;
    validateTransition(fromStatus?: string, toStatus?: string): boolean;
}
