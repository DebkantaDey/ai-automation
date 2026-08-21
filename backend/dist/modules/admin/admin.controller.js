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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const super_admin_guard_1 = require("./guards/super-admin.guard");
const pagination_dto_1 = require("../../core/common/dto/pagination.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getOverview() {
        return this.adminService.getPlatformOverview();
    }
    async getHealth() {
        return this.adminService.getSystemHealth();
    }
    async listOrganizations(pagination) {
        return this.adminService.listOrganizations(pagination);
    }
    async listGlobalAuditLogs(pagination) {
        return this.adminService.listGlobalAuditLogs(pagination);
    }
    async listGlobalDlq(pagination) {
        return this.adminService.listGlobalDeadLetterQueue(pagination);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform-wide aggregated business and execution metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOverview", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Deep infrastructure health diagnostics (DB, Redis, Queues, AI, Payments)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getHealth", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Get)('organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tenant organizations across platform' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listOrganizations", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Global cross-tenant security audit logs' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listGlobalAuditLogs", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Get)('dlq'),
    (0, swagger_1.ApiOperation)({ summary: 'Global Dead Letter Queue failed execution inspector' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listGlobalDlq", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Platform SuperAdmin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map