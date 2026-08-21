import { BadRequestException } from '@nestjs/common';
import { BillingWebhookService } from '../../../modules/billing/services/billing-webhook.service';
import { SubscriptionEventsService } from '../../../modules/billing/services/subscription-events.service';
import { SubscriptionStatusService } from '../../../modules/billing/services/subscription-status.service';
import { DEFAULT_PLANS } from '../../../modules/billing/constants/default-plans';

describe('Payment Provider Integrations & Webhook Synchronization', () => {
  let webhookService: BillingWebhookService;
  let eventsService: SubscriptionEventsService;
  let statusService: SubscriptionStatusService;

  let mockWebhookEventModel: any;
  let mockPaymentModel: any;
  let mockInvoiceModel: any;
  let mockSubscriptionModel: any;
  let mockPlanModel: any;
  let mockOrgModel: any;
  let mockBillingService: any;
  let mockStripeProvider: any;
  let mockRazorpayProvider: any;

  beforeEach(() => {
    mockWebhookEventModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'wh-evt-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockWebhookEventModel.findOne = jest.fn().mockResolvedValue(null);

    mockPaymentModel = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ _id: 'pay-1', status: 'succeeded' }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ _id: 'pay-1', amount: 29, currency: 'USD' }]),
          }),
        }),
      }),
    };

    mockInvoiceModel = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ _id: 'inv-1', status: 'paid' }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ _id: 'inv-1', invoiceNumber: 'INV-1001', amount: 29 }]),
          }),
        }),
      }),
    };

    mockSubscriptionModel = {
      findOne: jest.fn().mockResolvedValue({
        _id: 'sub-org-1',
        organizationId: 'org-1',
        status: 'trialing',
        save: jest.fn().mockResolvedValue(true),
      }),
    };

    mockPlanModel = {
      findOne: jest.fn().mockResolvedValue({
        _id: 'plan-starter-id',
        slug: 'starter',
        name: 'Starter',
      }),
    };

    mockOrgModel = {
      findById: jest.fn().mockResolvedValue({
        _id: 'org-1',
        name: 'Acme Corp',
        slug: 'acme',
        plan: 'free',
        save: jest.fn().mockResolvedValue(true),
      }),
    };

    mockStripeProvider = {
      verifyWebhookSignature: jest.fn(),
    };

    mockRazorpayProvider = {
      verifyWebhookSignature: jest.fn(),
    };

    mockBillingService = {
      getProvider: jest.fn().mockImplementation((provider) => {
        if (provider === 'stripe') return mockStripeProvider;
        if (provider === 'razorpay') return mockRazorpayProvider;
        throw new Error('Unknown provider');
      }),
    };

    const mockConfigService: any = {
      get: jest.fn().mockReturnValue({ gracePeriodDays: 3 }),
    };

    eventsService = new SubscriptionEventsService();
    statusService = new SubscriptionStatusService(mockConfigService);

    webhookService = new BillingWebhookService(
      mockWebhookEventModel as any,
      mockPaymentModel as any,
      mockInvoiceModel as any,
      mockSubscriptionModel as any,
      mockPlanModel as any,
      mockOrgModel as any,
      mockBillingService as any,
      eventsService,
      statusService,
    );
  });

  describe('1. Webhook Signature Verification & Header Enforcement', () => {
    it('should reject webhook request if signature header is missing', async () => {
      await expect(
        webhookService.handleWebhook('stripe', '{"type":"checkout.session.completed"}', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject webhook if provider signature verification fails', async () => {
      mockStripeProvider.verifyWebhookSignature.mockRejectedValue(
        new BadRequestException('Invalid Stripe webhook signature'),
      );

      await expect(
        webhookService.handleWebhook('stripe', 'payload', 'forged_signature'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('2. Idempotency & Duplicate Delivery Protection', () => {
    it('should process webhook event for the first time and record eventId', async () => {
      mockStripeProvider.verifyWebhookSignature.mockResolvedValue({
        eventId: 'evt_stripe_123',
        provider: 'stripe',
        eventType: 'checkout.session.completed',
        organizationId: 'org-1',
        subscriptionId: 'sub_stripe_abc',
        customerId: 'cus_stripe_xyz',
        amount: 29,
        currency: 'USD',
        raw: {},
      });

      const res = await webhookService.handleWebhook('stripe', 'payload', 'valid_sig');

      expect(res.received).toBe(true);
      expect(res.status).toBe('processed');
      expect(res.eventId).toBe('evt_stripe_123');
      expect(mockWebhookEventModel).toHaveBeenCalled();
    });

    it('should return already_processed on duplicate event delivery without mutating state', async () => {
      mockStripeProvider.verifyWebhookSignature.mockResolvedValue({
        eventId: 'evt_duplicate_999',
        provider: 'stripe',
        eventType: 'checkout.session.completed',
        organizationId: 'org-1',
        raw: {},
      });

      mockWebhookEventModel.findOne.mockResolvedValue({
        provider: 'stripe',
        providerEventId: 'evt_duplicate_999',
        status: 'processed',
      });

      const res = await webhookService.handleWebhook('stripe', 'payload', 'valid_sig');

      expect(res.received).toBe(true);
      expect(res.status).toBe('already_processed');
      expect(mockSubscriptionModel.findOne).not.toHaveBeenCalled();
    });
  });

  describe('3. Successful Checkout & Subscription Activation', () => {
    it('should activate subscription, update org plan, and store provider IDs', async () => {
      const mockSub = {
        _id: 'sub-org-1',
        organizationId: 'org-1',
        status: 'trialing',
        save: jest.fn().mockResolvedValue(true),
      };
      mockSubscriptionModel.findOne.mockResolvedValue(mockSub);

      mockStripeProvider.verifyWebhookSignature.mockResolvedValue({
        eventId: 'evt_checkout_success',
        provider: 'stripe',
        eventType: 'checkout.session.completed',
        organizationId: 'org-1',
        subscriptionId: 'sub_stripe_prod_1',
        customerId: 'cus_stripe_cust_1',
        metadata: { planSlug: 'starter' },
        raw: {},
      });

      const res = await webhookService.handleWebhook('stripe', 'payload', 'valid_sig');

      expect(res.status).toBe('processed');
      expect(mockSub.status).toBe('active');
      expect(mockSub.save).toHaveBeenCalled();
    });
  });

  describe('4. Invoice Paid & Payment Succeeded Records', () => {
    it('should create Payment and Invoice records upon invoice.paid event', async () => {
      mockStripeProvider.verifyWebhookSignature.mockResolvedValue({
        eventId: 'evt_invoice_paid_123',
        provider: 'stripe',
        eventType: 'invoice.paid',
        organizationId: 'org-1',
        subscriptionId: 'sub_stripe_prod_1',
        invoiceId: 'in_stripe_001',
        paymentId: 'pi_stripe_pay_1',
        amount: 99,
        currency: 'USD',
        invoiceUrl: 'https://stripe.com/invoices/in_stripe_001',
        raw: {},
      });

      const res = await webhookService.handleWebhook('stripe', 'payload', 'valid_sig');

      expect(res.status).toBe('processed');
      expect(mockPaymentModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ providerPaymentId: 'pi_stripe_pay_1' }),
        expect.anything(),
        expect.anything(),
      );
      expect(mockInvoiceModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ providerInvoiceId: 'in_stripe_001' }),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('5. Payment Failure & Grace Period Handling', () => {
    it('should transition subscription to past_due and log failed payment', async () => {
      const mockSub = {
        _id: 'sub-org-1',
        organizationId: 'org-1',
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };
      mockSubscriptionModel.findOne.mockResolvedValue(mockSub);

      mockStripeProvider.verifyWebhookSignature.mockResolvedValue({
        eventId: 'evt_payment_failed_123',
        provider: 'stripe',
        eventType: 'invoice.payment_failed',
        organizationId: 'org-1',
        subscriptionId: 'sub_stripe_prod_1',
        paymentId: 'pi_failed_1',
        amount: 29,
        raw: {},
      });

      const res = await webhookService.handleWebhook('stripe', 'payload', 'valid_sig');

      expect(res.status).toBe('processed');
      expect(mockSub.status).toBe('past_due');
      expect(mockPaymentModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ providerPaymentId: 'pi_failed_1' }),
        expect.objectContaining({ $set: expect.objectContaining({ status: 'failed' }) }),
        expect.anything(),
      );
    });
  });

  describe('6. Subscription Cancellation Synchronization', () => {
    it('should transition subscription to cancelled and revert org plan to free', async () => {
      const mockSub = {
        _id: 'sub-org-1',
        organizationId: 'org-1',
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };
      const mockOrg = {
        _id: 'org-1',
        plan: 'business',
        save: jest.fn().mockResolvedValue(true),
      };

      mockSubscriptionModel.findOne.mockResolvedValue(mockSub);
      mockOrgModel.findById.mockResolvedValue(mockOrg);

      mockRazorpayProvider.verifyWebhookSignature.mockResolvedValue({
        eventId: 'evt_razorpay_sub_cancelled',
        provider: 'razorpay',
        eventType: 'subscription.cancelled',
        organizationId: 'org-1',
        subscriptionId: 'sub_rzp_1',
        raw: {},
      });

      const res = await webhookService.handleWebhook('razorpay', 'payload', 'valid_sig');

      expect(res.status).toBe('processed');
      expect(mockSub.status).toBe('cancelled');
      expect(mockOrg.plan).toBe('free');
      expect(mockOrg.save).toHaveBeenCalled();
    });
  });

  describe('7. Multi-Tenant Payment & Invoice Retrieval', () => {
    it('should retrieve invoices strictly filtered by organizationId', async () => {
      const invoices = await webhookService.getOrganizationInvoices('org-1');
      expect(mockInvoiceModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1' }),
      );
      expect(invoices.length).toBe(1);
    });

    it('should retrieve payments strictly filtered by organizationId', async () => {
      const payments = await webhookService.getOrganizationPayments('org-1');
      expect(mockPaymentModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1' }),
      );
      expect(payments.length).toBe(1);
    });
  });
});
