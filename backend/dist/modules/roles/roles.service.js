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
var RolesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("./schemas/role.schema");
const organization_member_schema_1 = require("../organizations/schemas/organization-member.schema");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
let RolesService = RolesService_1 = class RolesService {
    roleModel;
    memberModel;
    logger = new common_1.Logger(RolesService_1.name);
    constructor(roleModel, memberModel) {
        this.roleModel = roleModel;
        this.memberModel = memberModel;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    getSystemRoles() {
        return [
            {
                id: 'system-owner',
                name: 'Owner',
                slug: 'owner',
                description: 'Full administrative access and ownership permissions across the organization',
                permissions: permission_enum_1.SystemRolePermissions['owner'],
                isSystemRole: true,
                isCustom: false,
            },
            {
                id: 'system-admin',
                name: 'Admin',
                slug: 'admin',
                description: 'Administrative access for team, workflows, integrations, and configurations',
                permissions: permission_enum_1.SystemRolePermissions['admin'],
                isSystemRole: true,
                isCustom: false,
            },
            {
                id: 'system-manager',
                name: 'Manager',
                slug: 'manager',
                description: 'Can build, configure, and delete workflows, AI agents, and integrations',
                permissions: permission_enum_1.SystemRolePermissions['manager'],
                isSystemRole: true,
                isCustom: false,
            },
            {
                id: 'system-operator',
                name: 'Operator',
                slug: 'operator',
                description: 'Can trigger, execute, and monitor automated workflows and AI tasks',
                permissions: permission_enum_1.SystemRolePermissions['operator'],
                isSystemRole: true,
                isCustom: false,
            },
            {
                id: 'system-viewer',
                name: 'Viewer',
                slug: 'viewer',
                description: 'Read-only access to organization workflows, analytics, and execution logs',
                permissions: permission_enum_1.SystemRolePermissions['viewer'],
                isSystemRole: true,
                isCustom: false,
            },
            {
                id: 'system-member',
                name: 'Member',
                slug: 'member',
                description: 'Standard member access with workflow execution and creation rights',
                permissions: permission_enum_1.SystemRolePermissions['member'],
                isSystemRole: true,
                isCustom: false,
            },
        ];
    }
    getAllPermissions() {
        return {
            permissions: permission_enum_1.ALL_PERMISSIONS,
            definitions: permission_enum_1.PERMISSION_DEFINITIONS,
        };
    }
    async getRolesForOrganization(orgId) {
        const customRoles = await this.roleModel.find({
            organizationId: this.toObjectId(orgId),
        });
        const systemRoles = this.getSystemRoles();
        const formattedCustomRoles = customRoles.map((r) => ({
            id: r._id.toString(),
            name: r.name,
            slug: r.slug,
            description: r.description,
            permissions: r.permissions,
            isSystemRole: false,
            isCustom: true,
            organizationId: r.organizationId?.toString(),
            createdAt: r.createdAt,
        }));
        return [...systemRoles, ...formattedCustomRoles];
    }
    async createCustomRole(orgId, userId, dto) {
        const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
        const systemSlugs = ['owner', 'admin', 'manager', 'operator', 'viewer', 'member', 'billing_manager'];
        if (systemSlugs.includes(slug)) {
            throw new common_1.ConflictException(`Role slug '${slug}' is reserved for system roles`);
        }
        const existing = await this.roleModel.findOne({
            organizationId: this.toObjectId(orgId),
            slug,
        });
        if (existing) {
            throw new common_1.ConflictException(`A role with slug '${slug}' already exists in this organization`);
        }
        const role = new this.roleModel({
            name: dto.name,
            slug,
            description: dto.description || '',
            organizationId: this.toObjectId(orgId),
            permissions: dto.permissions,
            isSystemRole: false,
            isCustom: true,
        });
        await role.save();
        return role;
    }
    async updateCustomRole(orgId, roleId, userId, dto) {
        const role = await this.roleModel.findOne({
            _id: this.toObjectId(roleId),
            organizationId: this.toObjectId(orgId),
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found in this organization');
        }
        if (role.isSystemRole) {
            throw new common_1.ForbiddenException('System roles cannot be modified');
        }
        if (dto.name !== undefined)
            role.name = dto.name;
        if (dto.description !== undefined)
            role.description = dto.description;
        if (dto.permissions !== undefined)
            role.permissions = dto.permissions;
        await role.save();
        return role;
    }
    async deleteCustomRole(orgId, roleId, userId) {
        const role = await this.roleModel.findOne({
            _id: this.toObjectId(roleId),
            organizationId: this.toObjectId(orgId),
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found in this organization');
        }
        if (role.isSystemRole) {
            throw new common_1.ForbiddenException('System roles cannot be deleted');
        }
        const assignedCount = await this.memberModel.countDocuments({
            organizationId: this.toObjectId(orgId),
            roleId: role._id,
        });
        if (assignedCount > 0) {
            throw new common_1.ConflictException(`Cannot delete role: ${assignedCount} active member(s) are currently assigned to this role. Reassign them first.`);
        }
        await this.roleModel.deleteOne({ _id: role._id });
        return {
            success: true,
            message: `Role '${role.name}' deleted successfully`,
        };
    }
    async resolvePermissions(orgId, roleNameOrId) {
        const roleKey = String(roleNameOrId).toLowerCase();
        if (permission_enum_1.SystemRolePermissions[roleKey]) {
            return permission_enum_1.SystemRolePermissions[roleKey];
        }
        if (orgId) {
            const query = { organizationId: this.toObjectId(orgId) };
            if (mongoose_2.Types.ObjectId.isValid(roleKey)) {
                query._id = this.toObjectId(roleKey);
            }
            else {
                query.slug = roleKey;
            }
            const customRole = await this.roleModel.findOne(query);
            if (customRole && Array.isArray(customRole.permissions)) {
                return customRole.permissions;
            }
        }
        return permission_enum_1.SystemRolePermissions['viewer'];
    }
    checkPermission(userPermissions, requiredPermission) {
        if (!userPermissions || userPermissions.length === 0) {
            return false;
        }
        if (userPermissions.includes('*')) {
            return true;
        }
        if (userPermissions.includes(requiredPermission)) {
            return true;
        }
        const [resource] = requiredPermission.split('.');
        if (resource && userPermissions.includes(`${resource}.*`)) {
            return true;
        }
        return false;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = RolesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(1, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RolesService);
//# sourceMappingURL=roles.service.js.map