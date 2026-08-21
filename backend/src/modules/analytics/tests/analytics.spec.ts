import { AnalyticsService } from '../analytics.service';

describe('Analytics & Executive Operations Dashboard Service', () => {
  let analyticsService: AnalyticsService;
  let mockWorkflowModel: any;
  let mockExecutionModel: any;
  let mockUsageModel: any;
  let mockLimitService: any;

  beforeEach(() => {
    mockWorkflowModel = {
      countDocuments: jest.fn().mockImplementation((filter) => {
        if (filter.status === 'active') return Promise.resolve(5);
        return Promise.resolve(8);
      }),
    };

    mockExecutionModel = {
      countDocuments: jest.fn().mockImplementation((filter) => {
        if (filter.status === 'completed') return Promise.resolve(90);
        if (filter.status === 'failed') return Promise.resolve(10);
        if (filter.status === 'waiting_approval') return Promise.resolve(2);
        return Promise.resolve(100);
      }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    };

    mockUsageModel = {
      findOne: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            workflowExecutions: 100,
            aiExecutions: 45,
            aiPromptTokens: 12000,
            aiCompletionTokens: 8000,
            aiTotalTokens: 20000,
            aiCostUsd: 0.04,
            storageBytes: 15 * 1024 * 1024,
          }),
        }),
      }),
    };

    mockLimitService = {
      getPlanLimits: jest.fn().mockResolvedValue({
        plan: { name: 'Starter', slug: 'starter' },
        limits: {
          maxWorkflows: 15,
          maxWorkflowExecutions: 500,
          maxAIExecutions: 100,
          maxStorage: 500,
        },
      }),
    };

    analyticsService = new AnalyticsService(
      mockWorkflowModel as any,
      mockExecutionModel as any,
      mockUsageModel as any,
      mockLimitService as any,
    );
  });

  it('should compute accurate success rate and failure rate percentages', async () => {
    const dashboard = await analyticsService.getDashboardAnalytics('org-1', 'ws-1');

    expect(dashboard.business.totalExecutions).toBe(100);
    expect(dashboard.business.completedExecutions).toBe(90);
    expect(dashboard.business.successRate).toBe(90);
    expect(dashboard.business.failureRate).toBe(10);
    expect(dashboard.ai.aiTotalTokens).toBe(20000);
    expect(dashboard.ai.estimatedCostUsd).toBe(0.04);
  });

  it('should compute resource quota utilization percentages', async () => {
    const dashboard = await analyticsService.getDashboardAnalytics('org-1', 'ws-1');

    expect(dashboard.quotas.monthlyExecutions.current).toBe(100);
    expect(dashboard.quotas.monthlyExecutions.limit).toBe(500);
    expect(dashboard.quotas.monthlyExecutions.percent).toBe(20);
  });
});
