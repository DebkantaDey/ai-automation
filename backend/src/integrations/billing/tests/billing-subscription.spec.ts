import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from '../../../modules/billing/services/subscriptions.service';
import { SubscriptionLimitService } from '../../../modules/billing/services/subscription-limit.service';
import { SubscriptionStatusService } from '../../../modules/billing/services/subscription-status.service';
import { SubscriptionEventsService } from '../../../modules/billing/services/subscription-events.service';
import { DEFAULT_PLANS } from '../../../modules/billing/constants/default-plans';

describe('SaaS Subscription & Billing Architecture', () => {
  let subscriptionsService: SubscriptionsService;
  let limitService: SubscriptionLimitService;

  let mockPlanModel: any;
  let mockSubscriptionModel: any;
  let mockOrgModel: any;
  let mockUserModel: any;
  let mockMemberModel: any;
  let mockWorkspaceModel: any;
  let mockBillingService: any;

  beforeEach(() => {
    mockPlanModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'plan-mock-id' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockPlanModel.findOne = jest.fn();
    mockPlanModel.find = jest.fn();

    mockSubscriptionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'sub-mock-id' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockSubscriptionModel.findOne = jest.fn();
    mockSubscriptionModel.findById = jest.fn();
    mockSubscriptionModel.findOneAndUpdate = jest.fn();

    mockOrgModel = {
      findById: jest.fn().mockResolvedValue({ _id: 'org-1', name: 'Acme Corp', slug: 'acme', plan: 'free', save: jest.fn().mockResolvedValue(true) }),
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
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }),
    };

    const mockConfigService: any = {
      get: jest.fn().mockReturnValue({
        trialEnabled: true,
        trialDurationDays: 7,
        trialPlan: 'starter',
        gracePeriodDays: 3,
      }),
    };

    const statusService = new SubscriptionStatusService(mockConfigService);
    const eventsService = new SubscriptionEventsService();

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
  });

  describe('1. Plan Architecture & Initialization', () => {
    it('should initialize all default plans if missing', async () => {
      mockPlanModel.findOne.mockResolvedValue(null);

      await subscriptionsService.ensureDefaultPlans();

      expect(mockPlanModel).toHaveBeenCalled();
    });

    it('should retrieve public active plans', async () => {
      mockPlanModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(DEFAULT_PLANS),
        }),
      });

      const plans = await subscriptionsService.getPublicPlans();
      expect(plans.length).toBe(4);
      expect(plans.some((p) => p.slug === 'business')).toBe(true);
    });
  });

  describe('2. Organization Subscription & Free Plan Fallback', () => {
    it('should auto-provision Free plan subscription if organization has none', async () => {
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      mockPlanModel.findOne.mockResolvedValue({
        _id: 'plan-free-id',
        slug: 'free',
        name: 'Free',
        limits: DEFAULT_PLANS[0].limits,
      });

      mockSubscriptionModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'sub-new-free',
            organizationId: 'org-1',
            status: 'active',
            billingInterval: 'monthly',
            planId: { name: 'Free', slug: 'free', limits: DEFAULT_PLANS[0].limits },
          }),
        }),
      });

      const result = await subscriptionsService.getOrganizationSubscription('org-1');
      expect(result.subscription.status).toBe('active');
    });
  });

  describe('3. Plan Limits & Capacity Enforcement', () => {
    it('should ALLOW action when within plan limit quota', async () => {
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            planId: {
              name: 'Starter',
              slug: 'starter',
              limits: { maxUsers: 5, maxWorkspaces: 3, maxWorkflows: 25 },
            },
          }),
        }),
      });

      const check = await limitService.checkLimit('org-1', 'maxUsers', 2);
      expect(check.allowed).toBe(true);
      expect(check.limit).toBe(5);
      expect(check.current).toBe(2);
    });

    it('should REJECT action when limit is reached', async () => {
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            planId: {
              name: 'Free',
              slug: 'free',
              limits: { maxUsers: 2, maxWorkspaces: 1 },
            },
          }),
        }),
      });

      const check = await limitService.checkLimit('org-1', 'maxUsers', 2);
      expect(check.allowed).toBe(false);
      expect(check.limit).toBe(2);
    });

    it('should ALLOW unlimited quota when limit is set to -1', async () => {
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            planId: {
              name: 'Enterprise',
              slug: 'enterprise',
              limits: { maxUsers: -1, maxWorkspaces: -1, maxWorkflows: -1 },
            },
          }),
        }),
      });

      const check = await limitService.checkLimit('org-1', 'maxWorkflows', 1500);
      expect(check.allowed).toBe(true);
      expect(check.limit).toBe(-1);
    });

    it('should throw ForbiddenException in canInviteMember when team capacity reached', async () => {
      mockMemberModel.countDocuments.mockResolvedValue(2);
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            planId: {
              name: 'Free',
              slug: 'free',
              limits: { maxUsers: 2 },
            },
          }),
        }),
      });

      await expect(limitService.canInviteMember('org-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('4. Plan Changing & Cancellation Lifecycle', () => {
    it('should update organization subscription plan and org plan string', async () => {
      mockPlanModel.findOne.mockResolvedValue({
        _id: 'plan-business-id',
        name: 'Business',
        slug: 'business',
      });

      mockSubscriptionModel.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'sub-1',
          planId: { name: 'Business', slug: 'business' },
          billingInterval: 'yearly',
          status: 'active',
        }),
      });

      const res = await subscriptionsService.changePlan('org-1', 'user-1', {
        planSlug: 'business',
        billingInterval: 'yearly',
      });

      expect(res.success).toBe(true);
      expect(mockOrgModel.findById).toHaveBeenCalled();
    });

    it('should schedule cancellation at period end', async () => {
      const mockSub = {
        _id: 'sub-1',
        organizationId: 'org-1',
        status: 'active',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: new Date(Date.now() + 86400000),
        save: jest.fn().mockResolvedValue(true),
      };
      mockSubscriptionModel.findOne.mockResolvedValue(mockSub);

      const res = await subscriptionsService.cancelSubscription('org-1', 'user-1');
      expect(res.success).toBe(true);
      expect(mockSub.cancelAtPeriodEnd).toBe(true);
    });

    it('should reactivate a cancelled subscription', async () => {
      const mockSub = {
        _id: 'sub-1',
        organizationId: 'org-1',
        status: 'cancelled',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(Date.now() + 86400000),
        save: jest.fn().mockResolvedValue(true),
      };
      mockSubscriptionModel.findOne.mockResolvedValue(mockSub);

      const res = await subscriptionsService.reactivateSubscription('org-1', 'user-1');
      expect(res.success).toBe(true);
      expect(mockSub.cancelAtPeriodEnd).toBe(false);
    });
  });
});
