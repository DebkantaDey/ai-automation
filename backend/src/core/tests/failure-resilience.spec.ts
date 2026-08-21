import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';
import { BillingWebhookService } from '../../modules/billing/services/billing-webhook.service';
import { SubscriptionEventsService } from '../../modules/billing/services/subscription-events.service';
import { SubscriptionStatusService } from '../../modules/billing/services/subscription-status.service';
import { WorkflowEngineService } from '../../modules/workflows/engine/workflow-engine.service';

describe('Failure Resilience & Chaos Fault Tolerance (Module 71)', () => {
  let aiGateway: AiGatewayService;
  let mockOpenAi: any;
  let mockGemini: any;
  let mockAnthropic: any;
  let mockConfig: any;

  let billingWebhookService: BillingWebhookService;
  let mockSubscriptionModel: any;
  let mockPlanModel: any;
  let mockPaymentModel: any;
  let mockInvoiceModel: any;
  let mockWebhookEventModel: any;
  let eventsService: SubscriptionEventsService;
  let statusService: SubscriptionStatusService;
  let mockOrgModel: any;
  let mockBillingService: any;
  let mockStripeProvider: any;

  let workflowEngine: WorkflowEngineService;
  let mockExecutionModel: any;
  let mockIntegrationsService: any;

  beforeEach(() => {
    mockConfig = { get: jest.fn().mockReturnValue({ defaultProvider: 'openai', gracePeriodDays: 7 }) };

    mockOpenAi = {
      providerName: 'openai',
      generateChat: jest.fn(),
      generateCompletion: jest.fn(),
    };
    mockGemini = {
      providerName: 'gemini',
      generateChat: jest.fn().mockResolvedValue({
        text: 'Fallback response from Gemini',
        model: 'gemini-1.5-pro',
        provider: 'gemini',
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      }),
      generateCompletion: jest.fn(),
    };
    mockAnthropic = {
      providerName: 'anthropic',
      generateChat: jest.fn(),
      generateCompletion: jest.fn(),
    };

    aiGateway = new AiGatewayService(
      mockConfig,
      mockOpenAi,
      mockGemini,
      mockAnthropic,
    );

    mockSubscriptionModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    mockPlanModel = { findOne: jest.fn() };
    mockPaymentModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockInvoiceModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockWebhookEventModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'wh-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockWebhookEventModel.findOne = jest.fn();

    eventsService = new SubscriptionEventsService();
    statusService = new SubscriptionStatusService(mockConfig);
    mockOrgModel = { findById: jest.fn() };

    mockStripeProvider = {
      verifyWebhookSignature: jest.fn(),
    };

    mockBillingService = {
      getProvider: jest.fn().mockReturnValue(mockStripeProvider),
    };

    billingWebhookService = new BillingWebhookService(
      mockWebhookEventModel as any,
      mockPaymentModel as any,
      mockInvoiceModel as any,
      mockSubscriptionModel,
      mockPlanModel,
      mockOrgModel,
      mockBillingService,
      eventsService,
      statusService,
    );

    mockExecutionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'exec-fail-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockIntegrationsService = {
      executeAction: jest.fn().mockRejectedValue(new Error('Network timeout: HubSpot API unreachable')),
    };

    workflowEngine = new WorkflowEngineService(
      mockExecutionModel as any,
      aiGateway as any,
      mockIntegrationsService as any,
      undefined,
    );
  });

  describe('1. AI Provider Outage & Automatic Fallback', () => {
    it('should seamlessly fallback to secondary provider when primary encounters 503/429', async () => {
      mockOpenAi.generateChat.mockRejectedValueOnce(new Error('503 Service Unavailable: OpenAI down'));

      const res = await aiGateway.generateChat(
        [{ role: 'user', content: 'Generate summary' }],
        { provider: 'openai', fallbackProviders: ['gemini'] },
      );

      expect(res.provider).toBe('gemini');
      expect(res.text).toBe('Fallback response from Gemini');
      expect(mockGemini.generateChat).toHaveBeenCalled();
    });
  });

  describe('2. Malformed AI Output & Auto-Repair Parsing', () => {
    it('should retry and parse JSON surrounded by markdown code blocks', async () => {
      mockOpenAi.generateChat.mockResolvedValueOnce({
        text: '```json\n{"category": "Urgent Support", "confidence": 0.98}\n```',
        usage: { promptTokens: 20, completionTokens: 15, totalTokens: 35 },
      });

      const structured = await aiGateway.structuredOutput<any>(
        'Classify ticket',
        '{ "category": "string", "confidence": "number" }',
      );

      expect(structured.data.category).toBe('Urgent Support');
      expect(structured.data.confidence).toBe(0.98);
    });
  });

  describe('3. External Integration Network Failure Containment', () => {
    it('should handle third-party HTTP timeouts gracefully and bubble descriptive error', async () => {
      const integrationNode = {
        id: 'action-hubspot',
        type: 'action_hubspot',
        label: 'HubSpot Create Contact',
        data: { connectionId: 'conn-1', action: 'create_contact' },
      };

      const context: any = { trigger: {}, steps: {} };
      const aiUsage: any = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

      await expect(
        workflowEngine.executeNode(integrationNode as any, context, aiUsage),
      ).rejects.toThrow('HubSpot API unreachable');
    });
  });

  describe('4. Duplicate Webhook Idempotency Guard', () => {
    it('should ignore duplicate webhooks and prevent double billing', async () => {
      mockStripeProvider.verifyWebhookSignature.mockResolvedValueOnce({
        eventId: 'evt_stripe_duplicate_123',
        eventType: 'invoice.payment_succeeded',
        provider: 'stripe',
        raw: {},
      });

      mockWebhookEventModel.findOne.mockResolvedValueOnce({
        _id: 'evt-1',
        providerEventId: 'evt_stripe_duplicate_123',
        status: 'processed',
      });

      const result = await billingWebhookService.handleWebhook(
        'stripe',
        JSON.stringify({}),
        'sig_test_123',
      );

      expect(result.status).toBe('already_processed');
    });
  });
});
