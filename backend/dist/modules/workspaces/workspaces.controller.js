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
exports.WorkspacesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workspaces_service_1 = require("./workspaces.service");
const create_workspace_dto_1 = require("./dto/create-workspace.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
let WorkspacesController = class WorkspacesController {
    workspacesService;
    constructor(workspacesService) {
        this.workspacesService = workspacesService;
    }
    async create(orgId, userId, dto) {
        return this.workspacesService.create(orgId, userId, dto);
    }
    async list(orgId) {
        return this.workspacesService.listByOrganization(orgId);
    }
    async getCurrent(orgId, workspaceId) {
        return this.workspacesService.getCurrent(orgId, workspaceId);
    }
    async getBySlug(orgId, slug) {
        return this.workspacesService.findBySlug(orgId, slug);
    }
    async getById(orgId, id) {
        return this.workspacesService.findById(id, orgId);
    }
    async update(orgId, id, dto) {
        return this.workspacesService.update(id, orgId, dto);
    }
    async archive(orgId, id) {
        return this.workspacesService.archive(id, orgId);
    }
    async delete(orgId, id) {
        return this.workspacesService.delete(id, orgId);
    }
};
exports.WorkspacesController = WorkspacesController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new workspace within active organization' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Workspace created successfully' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_workspace_dto_1.CreateWorkspaceDto]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all workspaces for active organization' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active workspace details' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Get)('by-slug/:slug'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get workspace details by slug' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "getBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get workspace details by ID' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update workspace metadata and settings' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_workspace_dto_1.UpdateWorkspaceDto]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_ARCHIVE),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a workspace (prevents new workflow executions)' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "archive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKSPACE_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a non-default workspace' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "delete", null);
exports.WorkspacesController = WorkspacesController = __decorate([
    (0, swagger_1.ApiTags)('Workspaces'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Controller)('workspaces'),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService])
], WorkspacesController);
//# sourceMappingURL=workspaces.controller.js.map