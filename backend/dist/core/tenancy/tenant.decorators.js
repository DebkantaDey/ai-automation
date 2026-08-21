"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentTenant = exports.CurrentWorkspaceId = exports.CurrentOrganizationId = exports.CurrentUser = exports.RequireWorkspace = exports.REQUIRE_WORKSPACE_KEY = exports.RequireTenant = exports.REQUIRE_TENANT_KEY = exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_service_1 = require("./tenant-context.service");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.REQUIRE_TENANT_KEY = 'requireTenant';
const RequireTenant = () => (0, common_1.SetMetadata)(exports.REQUIRE_TENANT_KEY, true);
exports.RequireTenant = RequireTenant;
exports.REQUIRE_WORKSPACE_KEY = 'requireWorkspace';
const RequireWorkspace = () => (0, common_1.SetMetadata)(exports.REQUIRE_WORKSPACE_KEY, true);
exports.RequireWorkspace = RequireWorkspace;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
        const context = tenant_context_service_1.TenantContextService.getContext();
        return data ? context?.[data] : context?.userId;
    }
    return data ? user?.[data] : user;
});
exports.CurrentOrganizationId = (0, common_1.createParamDecorator)((_, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.headers['x-organization-id'] || req.user?.organizationId || tenant_context_service_1.TenantContextService.getOrganizationId();
});
exports.CurrentWorkspaceId = (0, common_1.createParamDecorator)((_, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.headers['x-workspace-id'] || req.user?.workspaceId || tenant_context_service_1.TenantContextService.getWorkspaceId();
});
exports.CurrentTenant = (0, common_1.createParamDecorator)((_, ctx) => {
    return tenant_context_service_1.TenantContextService.getContext();
});
//# sourceMappingURL=tenant.decorators.js.map