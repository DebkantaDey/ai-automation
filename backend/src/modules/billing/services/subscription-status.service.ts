import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionDocument, SubscriptionStatus } from '../schemas/subscription.schema';
import { BillingConfig } from '../../../core/config/billing.config';

export type ComputedSubscriptionState =
  | 'trial_active'
  | 'trial_expiring_soon'
  | 'trial_expired'
  | 'paid_active'
  | 'past_due_grace'
  | 'past_due_restricted'
  | 'cancelled'
  | 'paused'
  | 'expired';

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

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  trialing: ['active', 'expired'],
  active: ['past_due', 'cancelled', 'paused'],
  past_due: ['active', 'cancelled', 'expired'],
  cancelled: ['active'],
  paused: ['active', 'cancelled'],
  expired: ['active'],
  incomplete: ['active', 'cancelled', 'expired'],
};

@Injectable()
export class SubscriptionStatusService {
  private readonly logger = new Logger(SubscriptionStatusService.name);
  private readonly gracePeriodDays: number;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<BillingConfig>('billing');
    this.gracePeriodDays = config?.gracePeriodDays || 3;
  }

  getSubscriptionStatus(
    subscription: Partial<SubscriptionDocument> | any,
    now = new Date(),
  ): ComputedSubscriptionStatusResult {
    const rawStatus = (subscription?.status || 'trialing') as SubscriptionStatus;
    const trialEnd = subscription?.trialEnd ? new Date(subscription.trialEnd) : undefined;
    const currentPeriodEnd = subscription?.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : new Date(now.getTime() + 7 * 24 * 3600 * 1000);

    let state: ComputedSubscriptionState = 'paid_active';
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
      } else {
        trialRemainingHours = Math.max(0, Math.ceil(diffMs / (1000 * 3600)));
        trialRemainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 3600 * 24)));

        if (trialRemainingDays <= 2) {
          state = 'trial_expiring_soon';
        } else {
          state = 'trial_active';
        }
      }
    } else if (rawStatus === 'active') {
      state = 'paid_active';
      canPerformMutations = true;
    } else if (rawStatus === 'past_due') {
      const graceEnd = new Date(currentPeriodEnd.getTime() + this.gracePeriodDays * 24 * 3600 * 1000);
      const diffGraceMs = graceEnd.getTime() - now.getTime();

      if (diffGraceMs > 0) {
        state = 'past_due_grace';
        isInGracePeriod = true;
        graceRemainingDays = Math.max(0, Math.ceil(diffGraceMs / (1000 * 3600 * 24)));
        canPerformMutations = true; // Still allow during grace period
      } else {
        state = 'past_due_restricted';
        canPerformMutations = false; // Grace expired, restricted to read-only
      }
    } else if (rawStatus === 'cancelled') {
      state = 'cancelled';
      canPerformMutations = false;
    } else if (rawStatus === 'paused') {
      state = 'paused';
      canPerformMutations = false;
    } else if (rawStatus === 'expired') {
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

  validateTransition(fromStatus = 'trialing', toStatus = 'active'): boolean {
    const from = (fromStatus || 'trialing').toLowerCase();
    const to = (toStatus || 'active').toLowerCase();

    // Idempotent self-transition
    if (from === to) {
      return true;
    }

    const allowed = ALLOWED_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new BadRequestException(
        `Invalid subscription state transition from '${from}' to '${to}'. Allowed: [${(allowed || []).join(', ')}]`,
      );
    }

    return true;
  }
}
