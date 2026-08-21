export declare class DistributedLockService {
    private readonly logger;
    private readonly activeLocks;
    acquireLock(resourceKey: string, ttlMs?: number, holder?: string): Promise<boolean>;
    releaseLock(resourceKey: string): Promise<void>;
    withLock<T>(resourceKey: string, ttlMs: number, fn: () => Promise<T>): Promise<T>;
}
