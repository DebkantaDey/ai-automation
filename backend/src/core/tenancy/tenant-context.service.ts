import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { TenantContext } from './tenant-context.interface';

@Injectable()
export class TenantContextService {
  private static readonly storage = new AsyncLocalStorage<TenantContext>();

  public static run<R>(context: TenantContext, callback: () => R): R {
    return this.storage.run(context, callback);
  }

  public static getContext(): TenantContext | undefined {
    return this.storage.getStore();
  }

  public static getOrganizationId(): string | undefined {
    return this.storage.getStore()?.organizationId;
  }

  public static getWorkspaceId(): string | undefined {
    return this.storage.getStore()?.workspaceId;
  }

  public static getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  public static setContext(updates: Partial<TenantContext>): void {
    const current = this.storage.getStore();
    if (current) {
      Object.assign(current, updates);
    }
  }

  // Instance methods for DI injection if needed
  public getContext(): TenantContext | undefined {
    return TenantContextService.getContext();
  }

  public getOrganizationId(): string | undefined {
    return TenantContextService.getOrganizationId();
  }

  public getWorkspaceId(): string | undefined {
    return TenantContextService.getWorkspaceId();
  }

  public getUserId(): string | undefined {
    return TenantContextService.getUserId();
  }
}
