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
exports.DealsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const deals_service_1 = require("../services/deals.service");
const deal_dto_1 = require("../dto/deal.dto");
const jwt_auth_guard_1 = require("../../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../../core/common/enums/permission.enum");
let DealsController = class DealsController {
    dealsService;
    constructor(dealsService) {
        this.dealsService = dealsService;
    }
    async createDeal(orgId, wsId, userId, dto) {
        return this.dealsService.createDeal(orgId, userId, dto, wsId);
    }
    async listDeals(orgId, search, stage, customerId, leadId, page, limit, sortBy, sortOrder) {
        return this.dealsService.listDeals(orgId, {
            search,
            stage,
            customerId,
            leadId,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            sortBy,
            sortOrder,
        });
    }
    async getPipelineSummary(orgId) {
        return this.dealsService.getPipelineSummary(orgId);
    }
    async getDealById(orgId, id) {
        return this.dealsService.getDealById(orgId, id);
    }
    async updateDeal(orgId, userId, id, dto) {
        return this.dealsService.updateDeal(orgId, id, dto, userId);
    }
    async deleteDeal(orgId, userId, id) {
        return this.dealsService.deleteDeal(orgId, id, userId);
    }
};
exports.DealsController = DealsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.DEALS_MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new pipeline deal' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, deal_dto_1.CreateDealDto]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "createDeal", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List deals with pipeline stage filters' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('stage')),
    __param(3, (0, common_1.Query)('customerId')),
    __param(4, (0, common_1.Query)('leadId')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "listDeals", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('summary'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get CRM Pipeline revenue and conversion analytics summary' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "getPipelineSummary", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CRM_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get deal details' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "getDealById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.DEALS_MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Update deal stage or probability' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, deal_dto_1.UpdateDealDto]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "updateDeal", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.DEALS_MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete deal' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DealsController.prototype, "deleteDeal", null);
exports.DealsController = DealsController = __decorate([
    (0, swagger_1.ApiTags)('CRM - Deals & Pipeline'),
    (0, common_1.Controller)('crm/deals'),
    __metadata("design:paramtypes", [deals_service_1.DealsService])
], DealsController);
//# sourceMappingURL=deals.controller.js.map