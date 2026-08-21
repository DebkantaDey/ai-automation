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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organizations_service_1 = require("./organizations.service");
const create_org_dto_1 = require("./dto/create-org.dto");
const update_org_dto_1 = require("./dto/update-org.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
const role_enum_1 = require("../../core/common/enums/role.enum");
let OrganizationsController = class OrganizationsController {
    orgService;
    constructor(orgService) {
        this.orgService = orgService;
    }
    async createOrg(userId, dto) {
        return this.orgService.create(userId, dto);
    }
    async getMyOrganizations(userId) {
        return this.orgService.getUserOrganizations(userId);
    }
    async getCurrentOrg(orgId, userId) {
        return this.orgService.getCurrentOrg(orgId, userId);
    }
    async getBySlug(slug, userId) {
        return this.orgService.findBySlug(slug, userId);
    }
    async getById(id, userId) {
        return this.orgService.findById(id, userId);
    }
    async updateOrg(id, userId, dto) {
        return this.orgService.update(id, userId, dto);
    }
    async deleteOrg(id, userId) {
        return this.orgService.delete(id, userId);
    }
    async switchOrg(id, userId) {
        return this.orgService.switchOrganization(userId, id);
    }
    async listMembers(id, userId) {
        return this.orgService.listMembers(id, userId);
    }
    async updateMemberRole(id, memberId, userId, role) {
        return this.orgService.updateMemberRole(id, userId, memberId, role);
    }
    async removeMember(id, memberId, userId) {
        return this.orgService.removeMember(id, userId, memberId);
    }
    async inviteMember(id, userId, dto) {
        return this.orgService.createInvitation(id, userId, dto);
    }
    async listInvitations(id, userId) {
        return this.orgService.listInvitations(id, userId);
    }
    async revokeInvitation(id, inviteId, userId) {
        return this.orgService.revokeInvitation(id, userId, inviteId);
    }
    async validateInvite(token) {
        return this.orgService.validateInvitationToken(token);
    }
    async acceptInvite(userId, token) {
        return this.orgService.acceptInvitation(userId, token);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Post)('organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new organization tenant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Organization and default workspace created successfully' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_org_dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "createOrg", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'List all organizations the authenticated user belongs to' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getMyOrganizations", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('organizations/current'),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.ORGANIZATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of the currently active organization tenant' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getCurrentOrg", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('organizations/by-slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Find organization metadata by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getBySlug", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('organizations/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.ORGANIZATION_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization details by ID with membership check' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Patch)('organizations/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.ORGANIZATION_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update organization settings' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_org_dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "updateOrg", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Delete)('organizations/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.ORGANIZATION_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Delete organization (Owner only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "deleteOrg", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('organizations/:id/switch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Switch active organization tenant context' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "switchOrg", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('organizations/:id/members'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MEMBERS_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all members in the organization' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "listMembers", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Patch)('organizations/:id/members/:memberId'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MEMBERS_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update member role in the organization' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "updateMemberRole", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Delete)('organizations/:id/members/:memberId'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MEMBERS_REMOVE),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a member from the organization' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "removeMember", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Post)('organizations/:id/invitations'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MEMBERS_INVITE),
    (0, swagger_1.ApiOperation)({ summary: 'Send email invitation to join organization' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_org_dto_1.InviteMemberDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "inviteMember", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('organizations/:id/invitations'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MEMBERS_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all pending invitations for the organization' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "listInvitations", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Delete)('organizations/:id/invitations/:inviteId'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MEMBERS_REMOVE),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a pending invitation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('inviteId')),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "revokeInvitation", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Get)('invitations/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate an invitation token and view organization metadata' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "validateInvite", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('invitations/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept an invitation and join organization team' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "acceptInvite", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('Organizations & Teams'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map