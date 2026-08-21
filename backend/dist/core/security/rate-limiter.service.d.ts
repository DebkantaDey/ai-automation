export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
}
export declare class RateLimiterService {
    private readonly logger;
    private readonly hitCounts;
    checkLimit(identifier: string, limit: number, durationSeconds?: number): Promise<RateLimitResult>;
}
