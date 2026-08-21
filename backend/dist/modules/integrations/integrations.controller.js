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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const integrations_service_1 = require("./integrations.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
let IntegrationsController = class IntegrationsController {
    integrationsService;
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    async getCatalog() {
        return this.integrationsService.getAvailableCatalog();
    }
    async listConnections(orgId, wsId) {
        return this.integrationsService.listConnections(orgId, wsId);
    }
    async connectWithApiKey(orgId, wsId, userId, dto) {
        return this.integrationsService.connectWithApiKey(orgId, wsId, userId, dto);
    }
    async getOAuthAuthorizeUrl(provider, state) {
        const url = this.integrationsService.getOAuthAuthorizeUrl(provider, state || 'default');
        return { url };
    }
    async handleOAuthCallback(orgId, wsId, userId, provider, code) {
        return this.integrationsService.handleOAuthCallback(orgId, wsId, userId, provider, code);
    }
    async testConnection(id, orgId, wsId) {
        const valid = await this.integrationsService.testConnection(id, orgId, wsId);
        return { valid, status: valid ? 'connected' : 'error' };
    }
    async disconnect(id, orgId, wsId) {
        await this.integrationsService.disconnect(id, orgId, wsId);
        return { success: true };
    }
    async executeAction(id, action, params) {
        return this.integrationsService.executeAction(id, action, params || {});
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('catalog'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List supported integration connector catalog' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getCatalog", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all active integration connections in current workspace' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "listConnections", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('connect/api-key'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_CONNECT),
    (0, swagger_1.ApiOperation)({ summary: 'Connect integration using API Key or Webhook URL' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "connectWithApiKey", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('oauth/:provider/authorize'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_CONNECT),
    (0, swagger_1.ApiOperation)({ summary: 'Get OAuth2 authorization URL for external provider' }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getOAuthAuthorizeUrl", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('oauth/:provider/callback'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_CONNECT),
    (0, swagger_1.ApiOperation)({ summary: 'Exchange OAuth2 authorization code and create connection' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Param)('provider')),
    __param(4, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "handleOAuthCallback", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/test'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Test connectivity and credentials for an integration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "testConnection", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect and purge an integration connection' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "disconnect", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/execute'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Execute an integration action directly' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('action')),
    __param(2, (0, common_1.Body)('params')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "executeAction", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('Integrations'),
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map