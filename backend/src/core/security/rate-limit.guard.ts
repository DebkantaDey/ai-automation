import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from './rate-limiter.service';

export interface RateLimitOptions {
  points: number;
  durationSeconds: number;
  tier?: 'auth' | 'api' | 'ai' | 'webhook' | 'upload';
}

export const RATE_LIMIT_KEY = 'rate_limit_options';
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimiter: RateLimiterService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const clientIp =
      request.headers['x-forwarded-for'] ||
      request.ip ||
      'unknown-client';

    const tenantId = request.tenant?.organizationId || '';
    const identifier = `${options.tier || 'default'}:${tenantId || clientIp}`;

    const res = await this.rateLimiter.checkLimit(
      identifier,
      options.points,
      options.durationSeconds,
    );

    response.setHeader('X-RateLimit-Limit', options.points);
    response.setHeader('X-RateLimit-Remaining', res.remaining);
    response.setHeader('X-RateLimit-Reset', res.resetSeconds);

    if (!res.allowed) {
      throw new HttpException(
        `Rate limit exceeded. Please try again in ${res.resetSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
