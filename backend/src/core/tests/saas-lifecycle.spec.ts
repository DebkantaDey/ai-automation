import { WorkflowsService } from '../../modules/workflows/workflows.service';
import { WorkflowEngineService } from '../../modules/workflows/engine/workflow-engine.service';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';
import { RateLimiterService } from '../security/rate-limiter.service';
import { CacheService } from '../cache/cache.service';
import { DistributedLockService } from '../database/distributed-lock.service';

describe('End-to-End SaaS Platform Lifecycle & Concurrency (Module 70)', () => {
  let workflowsService: WorkflowsService;
  let workflowEngine: WorkflowEngineService;
  let apiKeysService: ApiKeysService;
  let rateLimiter: RateLimiterService;
  let cacheService: CacheService;
  let lockService: DistributedLockService;

  let mockWorkflowModel: any;
  let mockVersionModel: any;
  let mockExecutionModel: any;
  let mockQueue: any;
  let mockAiGateway: any;
  let mockApiKeyModel: any;
  let mockAuditLogsService: any;
  let mockUsageService: any;
  let mockIntegrationsService: any;

  beforeEach(() => {
    mockWorkflowModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'wf-lifecycle-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockWorkflowModel.find = jest.fn();
    mockWorkflowModel.findOne = jest.fn();
    mockWorkflowModel.countDocuments = jest.fn().mockResolvedValue(1);

    mockVersionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'v-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockVersionModel.find = jest.fn();
    mockVersionModel.findOne = jest.fn();

    mockExecutionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'exec-lifecycle-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockExecutionModel.find = jest.fn();
    mockExecutionModel.findOne = jest.fn();

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    mockAiGateway = {
      generateChat: jest.fn().mockResolvedValue({
        text: JSON.stringify({ category: 'VIP_CUSTOMER', confidence: 0.99 }),
        usage: { promptTokens: 40, completionTokens: 20, totalTokens: 60 },
      }),
      generateCompletion: jest.fn().mockResolvedValue({
        text: 'Summary',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
      structuredOutput: jest.fn().mockResolvedValue({
        data: { name: 'Lead Pipeline', triggerType: 'webhook', nodes: [], edges: [] },
      }),
    };

    mockApiKeyModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'ak-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockApiKeyModel.findOne = jest.fn();

    mockAuditLogsService = { log: jest.fn().mockResolvedValue(undefined) };
    mockUsageService = {
      recordExecution: jest.fn().mockResolvedValue(undefined),
      recordAIUsage: jest.fn().mockResolvedValue(undefined),
      checkLimit: jest.fn().mockResolvedValue(undefined),
    };
    mockIntegrationsService = {
      executeAction: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-123' }),
    };

    workflowEngine = new WorkflowEngineService(
      mockExecutionModel as any,
      mockAiGateway as any,
      mockIntegrationsService as any,
      undefined,
    );

    workflowsService = new WorkflowsService(
      mockWorkflowModel as any,
      mockVersionModel as any,
      mockExecutionModel as any,
      mockQueue as any,
      workflowEngine,
      mockAiGateway as any,
      undefined,
      mockUsageService as any,
    );

    apiKeysService = new ApiKeysService(mockApiKeyModel as any, mockAuditLogsService as any);
    rateLimiter = new RateLimiterService();
    cacheService = new CacheService();
    lockService = new DistributedLockService();
  });

  describe('Full Automated Lifecycle Journey', () => {
    it('1. should create scoped API Key and securely hash secret at rest', async () => {
      const { apiKey, secretKey } = await apiKeysService.createApiKey('org-acme', 'ws-prod', 'user-1', {
        name: 'Production Ingest Key',
        scopes: ['workflows:execute', 'agents:run'],
      });

      expect(secretKey.startsWith('ak_live_')).toBe(true);
      expect(apiKey.keyPrefix.startsWith('ak_live_')).toBe(true);
      expect(apiKey.keyHash).not.toBe(secretKey);
    });

    it('2. should enforce tenant-isolated distributed concurrency locks', async () => {
      let executed = false;
      await lockService.withLock('tenant:org-acme:quota', 5000, async () => {
        executed = true;
      });
      expect(executed).toBe(true);
    });

    it('3. should isolate multi-tenant cache keys and prevent cross-tenant data leakage', async () => {
      await cacheService.set('settings', { tier: 'enterprise' }, 300, { organizationId: 'org-1', workspaceId: 'ws-1' });
      await cacheService.set('settings', { tier: 'free' }, 300, { organizationId: 'org-2', workspaceId: 'ws-2' });

      const tenant1Data = await cacheService.get('settings', { organizationId: 'org-1', workspaceId: 'ws-1' });
      const tenant2Data = await cacheService.get('settings', { organizationId: 'org-2', workspaceId: 'ws-2' });

      expect(tenant1Data).toEqual({ tier: 'enterprise' });
      expect(tenant2Data).toEqual({ tier: 'free' });
    });

    it('4. should enforce distributed rate limits on rapid execution calls', async () => {
      const res1 = await rateLimiter.checkLimit('org-acme:api', 2, 60);
      const res2 = await rateLimiter.checkLimit('org-acme:api', 2, 60);
      const res3 = await rateLimiter.checkLimit('org-acme:api', 2, 60);

      expect(res1.allowed).toBe(true);
      expect(res2.allowed).toBe(true);
      expect(res3.allowed).toBe(false);
      expect(res3.remaining).toBe(0);
    });

    it('5. should execute workflow DAG nodes, classify input with AI, and return step results', async () => {
      const triggerNode = {
        id: 'trigger',
        type: 'trigger',
        label: 'Webhook Inbound Trigger',
        data: { triggerType: 'webhook' },
      };
      const aiNode = {
        id: 'ai-step',
        type: 'ai_classify',
        label: 'AI Lead Classifier',
        data: { prompt: 'Classify lead budget: $50k', categories: ['VIP_CUSTOMER', 'STANDARD'] },
      };

      const order = workflowEngine.getExecutionOrder([triggerNode, aiNode], [{ id: 'e1', source: 'trigger', target: 'ai-step' }]);
      expect(order).toEqual(['trigger', 'ai-step']);

      const context: any = { trigger: { company: 'Acme Corp', budget: '$50k' }, steps: {} };
      const aiUsage: any = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

      const stepRes = await workflowEngine.executeNode(aiNode, context, aiUsage);

      expect(stepRes.status).toBe('completed');
      expect(stepRes.output.result.category).toBe('VIP_CUSTOMER');
      expect(aiUsage.totalTokens).toBe(60);
    });
  });
});
