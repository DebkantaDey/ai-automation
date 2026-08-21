"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IdempotencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyService = void 0;
const common_1 = require("@nestjs/common");
let IdempotencyService = IdempotencyService_1 = class IdempotencyService {
    logger = new common_1.Logger(IdempotencyService_1.name);
    records = new Map();
    async getRecord(key) {
        return this.records.get(key) || null;
    }
    async markInProgress(key, ttlSeconds = 300) {
        const existing = this.records.get(key);
        if (existing) {
            return false;
        }
        this.records.set(key, {
            status: 'in_progress',
            createdAt: Date.now(),
        });
        setTimeout(() => this.records.delete(key), ttlSeconds * 1000);
        return true;
    }
    async saveResponse(key, statusCode, body) {
        this.records.set(key, {
            status: 'completed',
            statusCode,
            body,
            createdAt: Date.now(),
        });
    }
    async clearKey(key) {
        this.records.delete(key);
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = IdempotencyService_1 = __decorate([
    (0, common_1.Injectable)()
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map