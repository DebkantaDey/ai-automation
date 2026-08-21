"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DistributedLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedLockService = void 0;
const common_1 = require("@nestjs/common");
let DistributedLockService = DistributedLockService_1 = class DistributedLockService {
    logger = new common_1.Logger(DistributedLockService_1.name);
    activeLocks = new Map();
    async acquireLock(resourceKey, ttlMs = 10000, holder = 'default') {
        const now = Date.now();
        const existing = this.activeLocks.get(resourceKey);
        if (existing && now < existing.expiresAt) {
            return false;
        }
        this.activeLocks.set(resourceKey, {
            expiresAt: now + ttlMs,
            holder,
        });
        return true;
    }
    async releaseLock(resourceKey) {
        this.activeLocks.delete(resourceKey);
    }
    async withLock(resourceKey, ttlMs, fn) {
        const acquired = await this.acquireLock(resourceKey, ttlMs);
        if (!acquired) {
            throw new Error(`Failed to acquire distributed concurrency lock for [${resourceKey}]`);
        }
        try {
            return await fn();
        }
        finally {
            await this.releaseLock(resourceKey);
        }
    }
};
exports.DistributedLockService = DistributedLockService;
exports.DistributedLockService = DistributedLockService = DistributedLockService_1 = __decorate([
    (0, common_1.Injectable)()
], DistributedLockService);
//# sourceMappingURL=distributed-lock.service.js.map