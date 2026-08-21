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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_service_1 = require("./roles.service");
const create_role_dto_1 = require("./dto/create-role.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
let RolesController = class RolesController {
    rolesService;
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    getPermissions() {
        return this.rolesService.getAllPermissions();
    }
    async getRoles(orgId) {
        return this.rolesService.getRolesForOrganization(orgId);
    }
    async createRole(orgId, userId, dto) {
        return this.rolesService.createCustomRole(orgId, userId, dto);
    }
    async updateRole(orgId, roleId, userId, dto) {
        return this.rolesService.updateCustomRole(orgId, roleId, userId, dto);
    }
    async deleteRole(orgId, roleId, userId) {
        return this.rolesService.deleteCustomRole(orgId, roleId, userId);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'List all system permission definitions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getPermissions", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Get)('organizations/:orgId/roles'),
    (0, swagger_1.ApiOperation)({ summary: 'List all system and custom roles for an organization' }),
    __param(0, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "getRoles", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Post)('organizations/:orgId/roles'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.ROLES_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a custom role for the organization' }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "createRole", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Patch)('organizations/:orgId/roles/:roleId'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.ROLES_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update a custom role' }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "updateRole", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Delete)('organizations/:orgId/roles/:roleId'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.ROLES_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a custom role (if not assigned to any member)' }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "deleteRole", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Roles & Permissions'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map