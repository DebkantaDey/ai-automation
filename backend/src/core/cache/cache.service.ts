import { Injectable, Logger } from '@nestjs/common';

export interface TenantCacheContext {
  organizationId: string;
  workspaceId?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryStore = new Map<string, { value: string; expiresAt: number }>();

  private buildKey(key: string, tenant?: TenantCacheContext): string {
    if (tenant?.organizationId) {
      const ws = tenant.workspaceId || 'global';
      return `tenant:${tenant.organizationId}:${ws}:${key}`;
    }
    return `system:${key}`;
  }

  async get<T>(key: string, tenant?: TenantCacheContext): Promise<T | null> {
    const fullKey = this.buildKey(key, tenant);
    const item = this.memoryStore.get(fullKey);

    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(fullKey);
      return null;
    }

    try {
      return JSON.parse(item.value) as T;
    } catch {
      return item.value as unknown as T;
    }
  }

  async set(
    key: string,
    value: any,
    ttlSeconds = 300,
    tenant?: TenantCacheContext,
  ): Promise<void> {
    const fullKey = this.buildKey(key, tenant);
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const expiresAt = Date.now() + ttlSeconds * 1000;

    this.memoryStore.set(fullKey, { value: serialized, expiresAt });
  }

  async del(key: string, tenant?: TenantCacheContext): Promise<void> {
    const fullKey = this.buildKey(key, tenant);
    this.memoryStore.delete(fullKey);
  }

  async invalidateTenantCache(organizationId: string, workspaceId?: string): Promise<void> {
    const prefix = workspaceId
      ? `tenant:${organizationId}:${workspaceId}:`
      : `tenant:${organizationId}:`;

    for (const k of this.memoryStore.keys()) {
      if (k.startsWith(prefix)) {
        this.memoryStore.delete(k);
      }
    }
    this.logger.debug(`Invalidated cache for prefix [${prefix}]`);
  }
}
