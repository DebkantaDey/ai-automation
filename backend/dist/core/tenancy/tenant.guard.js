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
exports.TenantGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_decorators_1 = require("./tenant.decorators");
const tenant_context_service_1 = require("./tenant-context.service");
const organization_member_schema_1 = require("../../modules/organizations/schemas/organization-member.schema");
let TenantGuard = class TenantGuard {
    reflector;
    memberModel;
    constructor(reflector, memberModel) {
        this.reflector = reflector;
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
        const requireTenant = this.reflector.getAllAndOverride(tenant_decorators_1.REQUIRE_TENANT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const requireWorkspace = this.reflector.getAllAndOverride(tenant_decorators_1.REQUIRE_WORKSPACE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        const userId = request?.user?.id || request?.user?._id?.toString();
        const orgId = request?.headers['x-organization-id'] ||
            tenant_context_service_1.TenantContextService.getOrganizationId();
        const wsId = request?.headers['x-workspace-id'] ||
            tenant_context_service_1.TenantContextService.getWorkspaceId();
        if (requireTenant && !orgId) {
            throw new common_1.BadRequestException('Organization context (x-organization-id) is required for this operation');
        }
        if (requireWorkspace && !wsId) {
            throw new common_1.BadRequestException('Workspace context (x-workspace-id) is required for this operation');
        }
        if (orgId && userId) {
            const member = await this.memberModel.findOne({
                organizationId: this.toObjectId(orgId),
                userId: this.toObjectId(userId),
                status: 'active',
            });
            if (!member) {
                throw new common_1.ForbiddenException('Access denied: You are not an active member of this organization');
            }
            if (request.user) {
                request.user.role = member.role;
                request.user.organizationId = String(orgId);
            }
        }
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __metadata("design:paramtypes", [core_1.Reflector,
        mongoose_2.Model])
], TenantGuard);
//# sourceMappingURL=tenant.guard.js.map