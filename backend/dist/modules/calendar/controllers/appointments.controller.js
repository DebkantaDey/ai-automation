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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appointments_service_1 = require("../services/appointments.service");
const appointment_dto_1 = require("../dto/appointment.dto");
const jwt_auth_guard_1 = require("../../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../../core/common/enums/permission.enum");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    async createAppointment(orgId, wsId, userId, dto) {
        return this.appointmentsService.createAppointment(orgId, userId, dto, wsId);
    }
    async listAppointments(orgId, startDate, endDate, staffUserId, customerId, status, page, limit) {
        return this.appointmentsService.listAppointments(orgId, {
            startDate,
            endDate,
            staffUserId,
            customerId,
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    async getAvailableSlots(orgId, date, staffUserId) {
        return this.appointmentsService.getAvailableSlots(orgId, date, staffUserId);
    }
    async setAvailability(orgId, wsId, userId, dto) {
        return this.appointmentsService.setAvailability(orgId, userId, dto, wsId);
    }
    async getAppointmentById(orgId, id) {
        return this.appointmentsService.getAppointmentById(orgId, id);
    }
    async updateAppointment(orgId, userId, id, dto) {
        return this.appointmentsService.updateAppointment(orgId, id, dto, userId);
    }
    async deleteAppointment(orgId, userId, id) {
        return this.appointmentsService.deleteAppointment(orgId, id, userId);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CALENDAR_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Book a new appointment' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "createAppointment", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CALENDAR_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List booked appointments' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('staffUserId')),
    __param(4, (0, common_1.Query)('customerId')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "listAppointments", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('availability'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CALENDAR_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate available booking time slots for a given date' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('staffUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAvailableSlots", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('availability'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CALENDAR_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Configure staff working hours availability' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, appointment_dto_1.SetAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "setAvailability", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CALENDAR_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get appointment details' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAppointmentById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CALENDAR_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule or update appointment' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, appointment_dto_1.UpdateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "updateAppointment", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.CALENDAR_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel appointment' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "deleteAppointment", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, swagger_1.ApiTags)('Calendar & Appointments'),
    (0, common_1.Controller)('calendar/appointments'),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map