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
exports.PrivacyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const privacy_service_1 = require("./privacy.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../core/auth/guards/roles.guard");
const roles_decorator_1 = require("../../core/auth/decorators/roles.decorator");
const role_enum_1 = require("../../core/common/enums/role.enum");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
let PrivacyController = class PrivacyController {
    privacyService;
    constructor(privacyService) {
        this.privacyService = privacyService;
    }
    async exportUserData(userId) {
        return this.privacyService.exportUserData(userId);
    }
    async exportOrgData(orgId) {
        return this.privacyService.exportOrganizationData(orgId);
    }
    async getConsent(userId) {
        const consent = await this.privacyService.getConsent(userId);
        return consent || { analyticsConsent: true, marketingConsent: false, dataProcessingConsent: true };
    }
    async updateConsent(userId, dto, ipAddress) {
        return this.privacyService.updateConsent(userId, { ...dto, ipAddress });
    }
    async deleteAccount(userId) {
        return this.privacyService.deleteUserAccount(userId);
    }
    async deleteOrganization(orgId) {
        return this.privacyService.deleteOrganization(orgId);
    }
};
exports.PrivacyController = PrivacyController;
__decorate([
    (0, common_1.Get)('export/user'),
    (0, swagger_1.ApiOperation)({ summary: 'Export user account data portability package (GDPR Article 20)' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "exportUserData", null);
__decorate([
    (0, common_1.Get)('export/organization'),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.OrganizationRole.OWNER, role_enum_1.OrganizationRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export organization data package (Workflows, Executions, Documents)' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "exportOrgData", null);
__decorate([
    (0, common_1.Get)('consent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user privacy consent settings' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "getConsent", null);
__decorate([
    (0, common_1.Post)('consent'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user GDPR / CCPA consent settings' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "updateConsent", null);
__decorate([
    (0, common_1.Delete)('account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete user account and personal data (Right to be Forgotten)' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Delete)('organization'),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.OrganizationRole.OWNER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete organization and cascade purge all workspaces & workflows' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "deleteOrganization", null);
exports.PrivacyController = PrivacyController = __decorate([
    (0, swagger_1.ApiTags)('Privacy & Compliance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('privacy'),
    __metadata("design:paramtypes", [privacy_service_1.PrivacyService])
], PrivacyController);
//# sourceMappingURL=privacy.controller.js.map