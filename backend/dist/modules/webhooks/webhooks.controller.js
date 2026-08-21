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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhooks_service_1 = require("./webhooks.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
const pagination_dto_1 = require("../../core/common/dto/pagination.dto");
let WebhooksController = class WebhooksController {
    webhooksService;
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async createEndpoint(orgId, wsId, userId, dto) {
        return this.webhooksService.createEndpoint(orgId, wsId, userId, dto);
    }
    async listEndpoints(orgId, wsId) {
        return this.webhooksService.listEndpoints(orgId, wsId);
    }
    async getEndpointById(id, orgId, wsId) {
        return this.webhooksService.getEndpointById(id, orgId, wsId);
    }
    async updateEndpoint(id, orgId, wsId, updates) {
        return this.webhooksService.updateEndpoint(id, orgId, wsId, updates);
    }
    async rotateSecret(id, orgId, wsId) {
        return this.webhooksService.rotateSecret(id, orgId, wsId);
    }
    async deleteEndpoint(id, orgId, wsId) {
        await this.webhooksService.deleteEndpoint(id, orgId, wsId);
        return { success: true };
    }
    async testPing(id, orgId, wsId) {
        return this.webhooksService.testPing(id, orgId, wsId);
    }
    async listDeliveries(orgId, wsId, endpointId, pagination) {
        return this.webhooksService.listDeliveries(orgId, wsId, endpointId, pagination);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('endpoints'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_CONNECT),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new outbound webhook endpoint' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "createEndpoint", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('endpoints'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all outbound webhook endpoints for workspace' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "listEndpoints", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('endpoints/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get details for a specific webhook endpoint' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "getEndpointById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Put)('endpoints/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update webhook endpoint URL, event types, or status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "updateEndpoint", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('endpoints/:id/rotate-secret'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate HMAC signing secret for webhook endpoint' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "rotateSecret", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Delete)('endpoints/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Delete outbound webhook endpoint' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "deleteEndpoint", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('endpoints/:id/test'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Send a test ping delivery to webhook endpoint' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "testPing", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('deliveries'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INTEGRATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List delivery attempt logs and responses' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, common_1.Query)('endpointId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "listDeliveries", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map