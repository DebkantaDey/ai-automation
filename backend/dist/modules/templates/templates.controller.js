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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const templates_service_1 = require("./templates.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
let TemplatesController = class TemplatesController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    listTemplates() {
        return this.templatesService.listTemplates();
    }
    getTemplateBySlug(slug) {
        return this.templatesService.getTemplateBySlug(slug);
    }
    async cloneTemplate(slug, orgId, wsId, userId, customName) {
        return this.templatesService.cloneTemplate(slug, orgId, wsId, userId, customName);
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List pre-built automation workflow templates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "listTemplates", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details for a specific workflow template' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "getTemplateBySlug", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':slug/clone'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Clone template into active workspace as a customizable workflow' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "cloneTemplate", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, swagger_1.ApiTags)('Automation Templates'),
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map