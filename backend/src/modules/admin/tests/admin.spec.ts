import { AdminService } from '../admin.service';

describe('Platform SuperAdmin & Infrastructure Health Service (Modules 55, 56)', () => {
  let adminService: AdminService;
  let mockConnection: any;
  let mockUserModel: any;
  let mockOrgModel: any;
  let mockSubscriptionModel: any;
  let mockWorkflowModel: any;
  let mockExecutionModel: any;
  let mockAuditLogModel: any;

  beforeEach(() => {
    mockConnection = {
      readyState: 1,
      db: {
        admin: () => ({
          ping: jest.fn().mockResolvedValue({ ok: 1 }),
        }),
      },
    };

    mockUserModel = { countDocuments: jest.fn().mockResolvedValue(150) };
    mockOrgModel = { countDocuments: jest.fn().mockResolvedValue(45), find: jest.fn() };
    mockSubscriptionModel = {
      countDocuments: jest.fn().mockImplementation((filter) => {
        if (filter.status === 'active') return Promise.resolve(30);
        if (filter.status === 'trialing') return Promise.resolve(10);
        return Promise.resolve(40);
      }),
    };
    mockWorkflowModel = { countDocuments: jest.fn().mockResolvedValue(300) };
    mockExecutionModel = {
      countDocuments: jest.fn().mockImplementation((filter) => {
        if (filter?.status === 'failed') return Promise.resolve(5);
        return Promise.resolve(2000);
      }),
      find: jest.fn(),
    };
    mockAuditLogModel = { countDocuments: jest.fn().mockResolvedValue(500), find: jest.fn() };

  adminService = new AdminService(
      mockConnection as any,
      mockUserModel as any,
      mockOrgModel as any,
      mockSubscriptionModel as any,
      mockWorkflowModel as any,
      mockExecutionModel as any,
      mockAuditLogModel as any,
    );
  });

  it('should return cross-tenant platform overview metrics', async () => {
    const overview = await adminService.getPlatformOverview();

    expect(overview.users.total).toBe(150);
    expect(overview.organizations.total).toBe(45);
    expect(overview.subscriptions.active).toBe(30);
    expect(overview.executions.total).toBe(2000);
    expect(overview.executions.successRate).toBeGreaterThan(99);
  });

  it('should return infrastructure component health diagnostics', async () => {
    const health = await adminService.getSystemHealth();

    expect(health.status).toBe('operational');
    expect(health.components.database.status).toBe('healthy');
    expect(health.components.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(health.components.aiGateway.providers).toHaveLength(3);
    expect(health.components.paymentGateways.stripe.status).toBe('connected');
  });
});
