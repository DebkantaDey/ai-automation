export interface TenantCacheContext {
    organizationId: string;
    workspaceId?: string;
}
export declare class CacheService {
    private readonly logger;
    private readonly memoryStore;
    private buildKey;
    get<T>(key: string, tenant?: TenantCacheContext): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number, tenant?: TenantCacheContext): Promise<void>;
    del(key: string, tenant?: TenantCacheContext): Promise<void>;
    invalidateTenantCache(organizationId: string, workspaceId?: string): Promise<void>;
}
