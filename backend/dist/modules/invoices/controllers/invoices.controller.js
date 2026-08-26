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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("../services/invoices.service");
const invoice_dto_1 = require("../dto/invoice.dto");
const jwt_auth_guard_1 = require("../../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../../core/common/enums/permission.enum");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async createInvoice(orgId, wsId, userId, dto) {
        return this.invoicesService.createInvoice(orgId, userId, dto, wsId);
    }
    async listInvoices(orgId, status, customerId, search, page, limit) {
        return this.invoicesService.listInvoices(orgId, {
            status,
            customerId,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    async getInvoiceSummary(orgId) {
        return this.invoicesService.getInvoiceSummary(orgId);
    }
    async getInvoiceById(orgId, id) {
        return this.invoicesService.getInvoiceById(orgId, id);
    }
    async sendInvoice(orgId, userId, id) {
        return this.invoicesService.sendInvoice(orgId, id, userId);
    }
    async markPaid(orgId, userId, id, dto) {
        return this.invoicesService.markPaid(orgId, id, dto, userId);
    }
    async updateInvoice(orgId, userId, id, dto) {
        return this.invoicesService.updateInvoice(orgId, id, dto, userId);
    }
    async deleteInvoice(orgId, userId, id) {
        return this.invoicesService.deleteInvoice(orgId, id, userId);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new customer invoice' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, invoice_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "createInvoice", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List customer invoices' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('customerId')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "listInvoices", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('summary'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoicing receivables and revenue summary' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getInvoiceSummary", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice details' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getInvoiceById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/send'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Mark invoice as sent' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "sendInvoice", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/mark-paid'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Settle invoice and record payment in ledger' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, invoice_dto_1.MarkPaidDto]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "markPaid", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Update invoice properties' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, invoice_dto_1.UpdateInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "updateInvoice", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INVOICES_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete an invoice' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "deleteInvoice", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Invoices & Billing Ledger'),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map