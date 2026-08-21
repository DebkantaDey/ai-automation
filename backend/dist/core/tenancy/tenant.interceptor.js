"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const tenant_context_service_1 = require("./tenant-context.service");
let TenantInterceptor = class TenantInterceptor {
    intercept(context, next) {
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            const organizationId = request.headers['x-organization-id'] ||
                request.user?.organizationId ||
                request.params?.organizationId ||
                request.query?.organizationId;
            const workspaceId = request.headers['x-workspace-id'] ||
                request.user?.workspaceId ||
                request.params?.workspaceId ||
                request.query?.workspaceId;
            const correlationId = request.headers['x-correlation-id'] || (0, uuid_1.v4)();
            const tenantContext = {
                userId: request.user?.id || request.user?._id?.toString(),
                userEmail: request.user?.email,
                organizationId: organizationId ? String(organizationId) : undefined,
                workspaceId: workspaceId ? String(workspaceId) : undefined,
                role: request.user?.role,
                permissions: request.user?.permissions,
                correlationId: String(correlationId),
            };
            const response = context.switchToHttp().getResponse();
            if (response && typeof response.setHeader === 'function') {
                response.setHeader('x-correlation-id', correlationId);
            }
            return new rxjs_1.Observable((subscriber) => {
                tenant_context_service_1.TenantContextService.run(tenantContext, () => {
                    next.handle().subscribe({
                        next: (val) => subscriber.next(val),
                        error: (err) => subscriber.error(err),
                        complete: () => subscriber.complete(),
                    });
                });
            });
        }
        return next.handle();
    }
};
exports.TenantInterceptor = TenantInterceptor;
exports.TenantInterceptor = TenantInterceptor = __decorate([
    (0, common_1.Injectable)()
], TenantInterceptor);
//# sourceMappingURL=tenant.interceptor.js.map