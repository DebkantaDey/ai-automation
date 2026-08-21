"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const crypto = require("crypto");
const SENSITIVE_KEYS = new Set([
    'password',
    'token',
    'accesstoken',
    'refreshtoken',
    'secret',
    'apikey',
    'cardnumber',
    'cvv',
    'clientsecret',
    'webhooksecret',
]);
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    sanitize(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        if (Array.isArray(obj))
            return obj.map((item) => this.sanitize(item));
        const clean = {};
        for (const [k, v] of Object.entries(obj)) {
            const lower = k.toLowerCase().replace(/[-_]/g, '');
            if (SENSITIVE_KEYS.has(lower)) {
                clean[k] = '[REDACTED]';
            }
            else if (typeof v === 'object') {
                clean[k] = this.sanitize(v);
            }
            else {
                clean[k] = v;
            }
        }
        return clean;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const requestId = request.headers['x-request-id'] || `req_${crypto.randomBytes(8).toString('hex')}`;
        request.requestId = requestId;
        response.setHeader('X-Request-ID', requestId);
        const startTime = Date.now();
        const { method, originalUrl, tenant } = request;
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;
                const tenantInfo = tenant ? `[Org: ${tenant.organizationId}] ` : '';
                this.logger.log(`[${requestId}] ${tenantInfo}${method} ${originalUrl} ${statusCode} +${duration}ms`);
            },
            error: (err) => {
                const duration = Date.now() - startTime;
                const tenantInfo = tenant ? `[Org: ${tenant.organizationId}] ` : '';
                this.logger.warn(`[${requestId}] ${tenantInfo}${method} ${originalUrl} ERR [${err.message}] +${duration}ms`);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map