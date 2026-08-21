import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);
  private readonly activeLocks = new Map<string, { expiresAt: number; holder: string }>();

  async acquireLock(resourceKey: string, ttlMs = 10000, holder = 'default'): Promise<boolean> {
    const now = Date.now();
    const existing = this.activeLocks.get(resourceKey);

    if (existing && now < existing.expiresAt) {
      return false; // Lock is currently held
    }

    this.activeLocks.set(resourceKey, {
      expiresAt: now + ttlMs,
      holder,
    });

    return true;
  }

  async releaseLock(resourceKey: string): Promise<void> {
    this.activeLocks.delete(resourceKey);
  }

  async withLock<T>(
    resourceKey: string,
    ttlMs: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    const acquired = await this.acquireLock(resourceKey, ttlMs);
    if (!acquired) {
      throw new Error(`Failed to acquire distributed concurrency lock for [${resourceKey}]`);
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(resourceKey);
    }
  }
}
