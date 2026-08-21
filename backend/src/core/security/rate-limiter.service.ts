import { Injectable, Logger } from '@nestjs/common';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly hitCounts = new Map<string, { count: number; expiresAt: number }>();

  async checkLimit(
    identifier: string,
    limit: number,
    durationSeconds = 60,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.hitCounts.get(identifier);

    if (!existing || now > existing.expiresAt) {
      this.hitCounts.set(identifier, {
        count: 1,
        expiresAt: now + durationSeconds * 1000,
      });

      return {
        allowed: true,
        remaining: limit - 1,
        resetSeconds: durationSeconds,
      };
    }

    if (existing.count >= limit) {
      const resetSeconds = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetSeconds,
      };
    }

    existing.count += 1;
    const resetSeconds = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));

    return {
      allowed: true,
      remaining: limit - existing.count,
      resetSeconds,
    };
  }
}
