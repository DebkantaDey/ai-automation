"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const tenant_context_service_1 = require("../../tenancy/tenant-context.service");
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode || 200;
        const tenantCtx = tenant_context_service_1.TenantContextService.getContext();
        return next.handle().pipe((0, operators_1.map)((result) => {
            if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
                return result;
            }
            if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
                return {
                    success: true,
                    statusCode,
                    data: result.data,
                    meta: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                        correlationId: tenantCtx?.correlationId,
                        timestamp: new Date().toISOString(),
                    },
                };
            }
            return {
                success: true,
                statusCode,
                data: result,
                meta: {
                    correlationId: tenantCtx?.correlationId,
                    timestamp: new Date().toISOString(),
                },
            };
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map