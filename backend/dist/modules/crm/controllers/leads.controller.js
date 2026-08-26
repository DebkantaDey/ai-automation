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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leads_service_1 = require("../services/leads.service");
const lead_dto_1 = require("../dto/lead.dto");
const jwt_auth_guard_1 = require("../../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../../core/common/enums/permission.enum");
let LeadsController = class LeadsController {
    leadsService;
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async createLead(orgId, wsId, userId, dto) {
        return this.leadsService.createLead(orgId, userId, dto, wsId);
    }
    async listLeads(orgId, search, status, source, priority, page, limit, sortBy, sortOrder) {
        return this.leadsService.listLeads(orgId, {
            search,
            status,
            source,
            priority,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            sortBy,
            sortOrder,
        });
    }
    async getLeadById(orgId, id) {
        return this.leadsService.getLeadById(orgId, id);
    }
    async updateLead(orgId, userId, id, dto) {
        return this.leadsService.updateLead(orgId, id, dto, userId);
    }
    async scoreLead(orgId, id, promptContext) {
        return this.leadsService.scoreLeadById(orgId, id, promptContext);
    }
    async convertLead(orgId, userId, id, dto) {
        return this.leadsService.convertLead(orgId, userId, id, dto);
    }
    async deleteLead(orgId, userId, id) {
        return this.leadsService.deleteLead(orgId, id, userId);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new CRM lead and auto-score' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, lead_dto_1.CreateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "createLead", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List leads with filters, search, and pagination' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('source')),
    __param(4, (0, common_1.Query)('priority')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "listLeads", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead details' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getLeadById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Update lead attributes or stage' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateLead", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/score'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger AI lead scoring recalculation' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('promptContext')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "scoreLead", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/convert'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Convert qualified lead to Customer and Deal' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, lead_dto_1.ConvertLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "convertLead", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a lead' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "deleteLead", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('CRM - Leads & Scoring'),
    (0, common_1.Controller)('crm/leads'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map