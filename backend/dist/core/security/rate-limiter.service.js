"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RateLimiterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
let RateLimiterService = RateLimiterService_1 = class RateLimiterService {
    logger = new common_1.Logger(RateLimiterService_1.name);
    hitCounts = new Map();
    async checkLimit(identifier, limit, durationSeconds = 60) {
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
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = RateLimiterService_1 = __decorate([
    (0, common_1.Injectable)()
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map