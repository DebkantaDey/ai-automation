import { TenantContextService } from './tenant-context.service';

describe('TenantContextService', () => {
  it('should isolate tenant context across asynchronous executions', async () => {
    const promise1 = new Promise<void>((resolve) => {
      TenantContextService.run(
        { organizationId: 'org-123', workspaceId: 'ws-123', userId: 'user-1' },
        async () => {
          await new Promise((r) => setTimeout(r, 20));
          expect(TenantContextService.getOrganizationId()).toBe('org-123');
          expect(TenantContextService.getWorkspaceId()).toBe('ws-123');
          expect(TenantContextService.getUserId()).toBe('user-1');
          resolve();
        },
      );
    });

    const promise2 = new Promise<void>((resolve) => {
      TenantContextService.run(
        { organizationId: 'org-456', workspaceId: 'ws-456', userId: 'user-2' },
        async () => {
          await new Promise((r) => setTimeout(r, 10));
          expect(TenantContextService.getOrganizationId()).toBe('org-456');
          expect(TenantContextService.getWorkspaceId()).toBe('ws-456');
          expect(TenantContextService.getUserId()).toBe('user-2');
          resolve();
        },
      );
    });

    await Promise.all([promise1, promise2]);
    expect(TenantContextService.getOrganizationId()).toBeUndefined();
  });
});
