"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = CacheService_1 = class CacheService {
    logger = new common_1.Logger(CacheService_1.name);
    memoryStore = new Map();
    buildKey(key, tenant) {
        if (tenant?.organizationId) {
            const ws = tenant.workspaceId || 'global';
            return `tenant:${tenant.organizationId}:${ws}:${key}`;
        }
        return `system:${key}`;
    }
    async get(key, tenant) {
        const fullKey = this.buildKey(key, tenant);
        const item = this.memoryStore.get(fullKey);
        if (!item)
            return null;
        if (Date.now() > item.expiresAt) {
            this.memoryStore.delete(fullKey);
            return null;
        }
        try {
            return JSON.parse(item.value);
        }
        catch {
            return item.value;
        }
    }
    async set(key, value, ttlSeconds = 300, tenant) {
        const fullKey = this.buildKey(key, tenant);
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.memoryStore.set(fullKey, { value: serialized, expiresAt });
    }
    async del(key, tenant) {
        const fullKey = this.buildKey(key, tenant);
        this.memoryStore.delete(fullKey);
    }
    async invalidateTenantCache(organizationId, workspaceId) {
        const prefix = workspaceId
            ? `tenant:${organizationId}:${workspaceId}:`
            : `tenant:${organizationId}:`;
        for (const k of this.memoryStore.keys()) {
            if (k.startsWith(prefix)) {
                this.memoryStore.delete(k);
            }
        }
        this.logger.debug(`Invalidated cache for prefix [${prefix}]`);
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map