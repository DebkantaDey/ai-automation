import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from '../../../modules/billing/services/subscriptions.service';
import { SubscriptionStatusService } from '../../../modules/billing/services/subscription-status.service';
import { SubscriptionAccessService } from '../../../modules/billing/services/subscription-access.service';
import { SubscriptionLimitService } from '../../../modules/billing/services/subscription-limit.service';
import { SubscriptionEventsService } from '../../../modules/billing/services/subscription-events.service';
import { DEFAULT_PLANS } from '../../../modules/billing/constants/default-plans';

describe('SaaS Trial Period & Subscription Lifecycle', () => {
  let subscriptionsService: SubscriptionsService;
  let statusService: SubscriptionStatusService;
  let accessService: SubscriptionAccessService;
  let limitService: SubscriptionLimitService;
  let eventsService: SubscriptionEventsService;

  let mockPlanModel: any;
  let mockSubscriptionModel: any;
  let mockOrgModel: any;
  let mockUserModel: any;
  let mockMemberModel: any;
  let mockWorkspaceModel: any;
  let mockConfigService: any;
  let mockBillingService: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'billing') {
          return {
            trialEnabled: true,
            trialDurationDays: 7,
            trialPlan: 'starter',
            gracePeriodDays: 3,
          };
        }
        return null;
      }),
    };

    mockPlanModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'plan-starter-id' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockPlanModel.findOne = jest.fn().mockResolvedValue({
      _id: 'plan-starter-id',
      slug: 'starter',
      name: 'Starter',
      limits: DEFAULT_PLANS[1].limits,
    });
    mockPlanModel.find = jest.fn();

    mockSubscriptionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'sub-trial-id' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockSubscriptionModel.findOne = jest.fn();
    mockSubscriptionModel.findById = jest.fn();
    mockSubscriptionModel.findOneAndUpdate = jest.fn();

    mockOrgModel = {
      findById: jest.fn().mockResolvedValue({ _id: 'org-1', name: 'Acme Corp', slug: 'acme', plan: 'starter', save: jest.fn().mockResolvedValue(true) }),
    };

    mockUserModel = {
      findById: jest.fn().mockResolvedValue({ _id: 'user-1', email: 'owner@acme.com' }),
    };

    mockMemberModel = {
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    mockWorkspaceModel = {
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    mockBillingService = {
      createSubscriptionCheckout: jest.fn().mockResolvedValue({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com',
      }),
    };

    statusService = new SubscriptionStatusService(mockConfigService);
    eventsService = new SubscriptionEventsService();
    limitService = new SubscriptionLimitService(
      mockSubscriptionModel as any,
      mockPlanModel as any,
      mockMemberModel as any,
      mockWorkspaceModel as any,
    );

    subscriptionsService = new SubscriptionsService(
      mockPlanModel as any,
      mockSubscriptionModel as any,
      mockOrgModel as any,
      mockUserModel as any,
      mockConfigService,
      mockBillingService as any,
      limitService,
      statusService,
      eventsService,
    );

    accessService = new SubscriptionAccessService(
      mockSubscriptionModel as any,
      statusService,
      limitService,
    );
  });

  describe('1. Idempotent Free Trial Creation', () => {
    it('should create a 7-day trial subscription with status trialing', async () => {
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      mockSubscriptionModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'sub-trial-id',
            organizationId: 'org-1',
            status: 'trialing',
            planId: { name: 'Starter', slug: 'starter' },
            trialStart: new Date(),
            trialEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          }),
        }),
      });

      const sub = await subscriptionsService.ensureTrialSubscription('org-1', 'user-1');
      expect(sub.status).toBe('trialing');
      expect((sub.planId as any).slug).toBe('starter');
      expect(mockSubscriptionModel).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'trialing' }),
      );
    });

    it('should return existing subscription without duplicating on retried calls', async () => {
      const existingSub = {
        _id: 'sub-existing',
        organizationId: 'org-1',
        status: 'trialing',
        planId: { name: 'Starter', slug: 'starter' },
      };

      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingSub),
        }),
      });

      const sub = await subscriptionsService.ensureTrialSubscription('org-1', 'user-1');
      expect(sub._id).toBe('sub-existing');
      expect(mockSubscriptionModel).not.toHaveBeenCalled();
    });
  });

  describe('2. Centralized Subscription Status & Trial Expiration', () => {
    it('should compute trial_active with correct remaining days', () => {
      const now = new Date('2026-08-21T00:00:00Z');
      const trialEnd = new Date('2026-08-26T00:00:00Z'); // 5 days left

      const status = statusService.getSubscriptionStatus(
        { status: 'trialing', trialEnd },
        now,
      );

      expect(status.state).toBe('trial_active');
      expect(status.trialRemainingDays).toBe(5);
      expect(status.canPerformMutations).toBe(true);
      expect(status.isReadOnly).toBe(false);
    });

    it('should compute trial_expiring_soon when 2 or fewer days remain', () => {
      const now = new Date('2026-08-21T00:00:00Z');
      const trialEnd = new Date('2026-08-22T12:00:00Z'); // 1.5 days left

      const status = statusService.getSubscriptionStatus(
        { status: 'trialing', trialEnd },
        now,
      );

      expect(status.state).toBe('trial_expiring_soon');
      expect(status.trialRemainingDays).toBe(2);
      expect(status.canPerformMutations).toBe(true);
    });

    it('should compute trial_expired and restrict mutations when trial period has elapsed', () => {
      const now = new Date('2026-08-21T00:00:00Z');
      const trialEnd = new Date('2026-08-20T00:00:00Z'); // Expired yesterday

      const status = statusService.getSubscriptionStatus(
        { status: 'trialing', trialEnd },
        now,
      );

      expect(status.state).toBe('trial_expired');
      expect(status.isTrialExpired).toBe(true);
      expect(status.canPerformMutations).toBe(false);
      expect(status.isReadOnly).toBe(true);
    });
  });

  describe('3. Grace Period & Payment Failure', () => {
    it('should allow mutations during payment grace period (past_due_grace)', () => {
      const now = new Date('2026-08-21T00:00:00Z');
      const currentPeriodEnd = new Date('2026-08-20T00:00:00Z'); // 1 day past due (within 3-day grace)

      const status = statusService.getSubscriptionStatus(
        { status: 'past_due', currentPeriodEnd },
        now,
      );

      expect(status.state).toBe('past_due_grace');
      expect(status.isInGracePeriod).toBe(true);
      expect(status.canPerformMutations).toBe(true);
    });

    it('should restrict access when grace period ends (past_due_restricted)', () => {
      const now = new Date('2026-08-21T00:00:00Z');
      const currentPeriodEnd = new Date('2026-08-15T00:00:00Z'); // 6 days past due (grace expired)

      const status = statusService.getSubscriptionStatus(
        { status: 'past_due', currentPeriodEnd },
        now,
      );

      expect(status.state).toBe('past_due_restricted');
      expect(status.isInGracePeriod).toBe(false);
      expect(status.canPerformMutations).toBe(false);
      expect(status.isReadOnly).toBe(true);
    });
  });

  describe('4. Subscription State Machine Transitions', () => {
    it('should permit valid transitions (e.g. trialing -> active, active -> past_due, past_due -> active)', () => {
      expect(statusService.validateTransition('trialing', 'active')).toBe(true);
      expect(statusService.validateTransition('active', 'past_due')).toBe(true);
      expect(statusService.validateTransition('past_due', 'active')).toBe(true);
      expect(statusService.validateTransition('active', 'cancelled')).toBe(true);
      expect(statusService.validateTransition('cancelled', 'active')).toBe(true);
    });

    it('should REJECT invalid transitions (e.g. trialing -> paused, cancelled -> past_due)', () => {
      expect(() => statusService.validateTransition('trialing', 'paused')).toThrow(BadRequestException);
      expect(() => statusService.validateTransition('cancelled', 'past_due')).toThrow(BadRequestException);
    });
  });

  describe('5. Access Control Policy Enforcement', () => {
    it('should BLOCK workflow creation when trial has expired', async () => {
      mockSubscriptionModel.findOne.mockResolvedValue({
        status: 'trialing',
        trialEnd: new Date(Date.now() - 86400000), // Expired
      });

      await expect(accessService.canCreateWorkflow('org-1')).rejects.toThrow(ForbiddenException);
    });

    it('should ALLOW workflow creation when trial is active', async () => {
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            status: 'trialing',
            trialEnd: new Date(Date.now() + 500000000),
            planId: { limits: DEFAULT_PLANS[1].limits },
          }),
        }),
      });

      const allowed = await accessService.canCreateWorkflow('org-1', 1);
      expect(allowed).toBe(true);
    });
  });
});
