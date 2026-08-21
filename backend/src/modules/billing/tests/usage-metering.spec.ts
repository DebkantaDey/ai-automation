import { ForbiddenException } from '@nestjs/common';
import { UsageService } from '../services/usage.service';

describe('Usage Metering & Tenant Quota Service', () => {
  let usageService: UsageService;
  let mockUsageModel: any;
  let mockLimitService: any;

  beforeEach(() => {
    mockUsageModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
    };

    mockLimitService = {
      getPlanLimits: jest.fn().mockResolvedValue({
        plan: {
          name: 'Starter',
          slug: 'starter',
        },
        limits: {
          maxWorkflowExecutions: 500,
          maxAIExecutions: 100,
          maxAPIRequests: 5000,
          maxStorage: 500,
          maxIntegrations: 3,
        },
      }),
    };

    usageService = new UsageService(mockUsageModel as any, mockLimitService as any);
  });

  describe('1. Billing Period & Metric Ingestion', () => {
    it('should format current billing period as YYYY-MM', () => {
      const period = usageService.getCurrentPeriodKey();
      expect(period).toMatch(/^\d{4}-\d{2}$/);
    });

    it('should atomically record workflow executions in current period', async () => {
      await usageService.recordWorkflowExecution('org-123');
      expect(mockUsageModel.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({ billingPeriod: expect.any(String) }),
        { $inc: { workflowExecutions: 1 } },
        { upsert: true },
      );
    });

    it('should atomically accumulate AI prompt and completion tokens with USD cost estimation', async () => {
      await usageService.recordAIUsage('org-123', {
        promptTokens: 150,
        completionTokens: 250,
        totalTokens: 400,
      });

      expect(mockUsageModel.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({ billingPeriod: expect.any(String) }),
        expect.objectContaining({
          $inc: expect.objectContaining({
            aiExecutions: 1,
            aiPromptTokens: 150,
            aiCompletionTokens: 250,
            aiTotalTokens: 400,
          }),
        }),
        { upsert: true },
      );
    });
  });

  describe('2. Quota & Limit Enforcement', () => {
    it('should pass checkLimit when usage is strictly below plan quota', async () => {
      mockUsageModel.findOne.mockResolvedValue({
        workflowExecutions: 450,
        aiExecutions: 80,
        apiRequests: 2000,
        storageBytes: 100 * 1024 * 1024,
      });

      await expect(usageService.checkLimit('org-123', 'workflowExecutions')).resolves.not.toThrow();
    });

    it('should throw ForbiddenException when monthly workflow execution limit is reached', async () => {
      mockUsageModel.findOne.mockResolvedValue({
        workflowExecutions: 500,
        aiExecutions: 10,
      });

      await expect(usageService.checkLimit('org-123', 'workflowExecutions')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when monthly AI execution limit is reached', async () => {
      mockUsageModel.findOne.mockResolvedValue({
        workflowExecutions: 100,
        aiExecutions: 100,
      });

      await expect(usageService.checkLimit('org-123', 'aiExecutions')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('3. Usage Overview Summary', () => {
    it('should calculate percentage utilized across all metered metrics', async () => {
      mockUsageModel.findOne.mockResolvedValue({
        billingPeriod: '2026-08',
        workflowExecutions: 250,
        aiExecutions: 50,
        aiTotalTokens: 12500,
        aiPromptTokens: 5000,
        aiCompletionTokens: 7500,
        aiCostUsd: 0.025,
        apiRequests: 1000,
        storageBytes: 250 * 1024 * 1024,
        integrationsCount: 2,
      });

      const overview = await usageService.getUsageOverview('org-123');

      expect(overview.metrics.workflowExecutions.used).toBe(250);
      expect(overview.metrics.workflowExecutions.percent).toBe(50);
      expect(overview.metrics.aiExecutions.percent).toBe(50);
      expect(overview.plan.name).toBe('Starter');
    });
  });
});
