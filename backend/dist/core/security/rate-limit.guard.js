"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = exports.RateLimit = exports.RATE_LIMIT_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rate_limiter_service_1 = require("./rate-limiter.service");
exports.RATE_LIMIT_KEY = 'rate_limit_options';
const RateLimit = (options) => (0, common_1.SetMetadata)(exports.RATE_LIMIT_KEY, options);
exports.RateLimit = RateLimit;
let RateLimitGuard = class RateLimitGuard {
    rateLimiter;
    reflector;
    constructor(rateLimiter, reflector) {
        this.rateLimiter = rateLimiter;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const options = this.reflector.getAllAndOverride(exports.RATE_LIMIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!options)
            return true;
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const clientIp = request.headers['x-forwarded-for'] ||
            request.ip ||
            'unknown-client';
        const tenantId = request.tenant?.organizationId || '';
        const identifier = `${options.tier || 'default'}:${tenantId || clientIp}`;
        const res = await this.rateLimiter.checkLimit(identifier, options.points, options.durationSeconds);
        response.setHeader('X-RateLimit-Limit', options.points);
        response.setHeader('X-RateLimit-Remaining', res.remaining);
        response.setHeader('X-RateLimit-Reset', res.resetSeconds);
        if (!res.allowed) {
            throw new common_1.HttpException(`Rate limit exceeded. Please try again in ${res.resetSeconds} seconds.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rate_limiter_service_1.RateLimiterService,
        core_1.Reflector])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map