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
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const tenant_decorators_1 = require("../../tenancy/tenant.decorators");
const role_enum_1 = require("../../common/enums/role.enum");
const roles_service_1 = require("../../../modules/roles/roles.service");
const organization_member_schema_1 = require("../../../modules/organizations/schemas/organization-member.schema");
const tenant_context_service_1 = require("../../tenancy/tenant-context.service");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    rolesService;
    memberModel;
    constructor(reflector, rolesService, memberModel) {
        this.reflector = reflector;
        this.rolesService = rolesService;
        this.memberModel = memberModel;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(tenant_decorators_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request?.user;
        if (!user) {
            throw new common_1.ForbiddenException('User context not found');
        }
        if (user.systemRole === role_enum_1.SystemRole.SUPER_ADMIN) {
            return true;
        }
        const orgId = request?.headers['x-organization-id'] ||
            request?.params?.orgId ||
            tenant_context_service_1.TenantContextService.getOrganizationId() ||
            user.organizationId;
        const userId = user.id || user._id?.toString();
        let userRole = user.role || 'viewer';
        let roleId = undefined;
        if (orgId && userId) {
            const member = await this.memberModel.findOne({
                organizationId: this.toObjectId(orgId),
                userId: this.toObjectId(userId),
                status: 'active',
            });
            if (!member) {
                throw new common_1.ForbiddenException('Access denied: You are not an active member of this organization');
            }
            userRole = member.role;
            roleId = member.roleId;
        }
        const effectivePermissions = await this.rolesService.resolvePermissions(orgId ? String(orgId) : undefined, roleId || userRole);
        const missingPermissions = requiredPermissions.filter((required) => !this.rolesService.checkPermission(effectivePermissions, String(required)));
        if (missingPermissions.length > 0) {
            throw new common_1.ForbiddenException(`Insufficient permissions. Missing: [${missingPermissions.join(', ')}]`);
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __metadata("design:paramtypes", [core_1.Reflector,
        roles_service_1.RolesService,
        mongoose_2.Model])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map