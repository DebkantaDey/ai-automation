import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from './rate-limiter.service';
export interface RateLimitOptions {
    points: number;
    durationSeconds: number;
    tier?: 'auth' | 'api' | 'ai' | 'webhook' | 'upload';
}
export declare const RATE_LIMIT_KEY = "rate_limit_options";
export declare const RateLimit: (options: RateLimitOptions) => import("@nestjs/common").CustomDecorator<string>;
export declare class RateLimitGuard implements CanActivate {
    private readonly rateLimiter;
    private readonly reflector;
    constructor(rateLimiter: RateLimiterService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
