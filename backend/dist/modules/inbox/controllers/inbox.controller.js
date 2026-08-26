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
exports.InboxController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inbox_service_1 = require("../services/inbox.service");
const inbox_dto_1 = require("../dto/inbox.dto");
const jwt_auth_guard_1 = require("../../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../../core/common/enums/permission.enum");
let InboxController = class InboxController {
    inboxService;
    constructor(inboxService) {
        this.inboxService = inboxService;
    }
    async listConversations(orgId, channel, status, search, page, limit) {
        return this.inboxService.listConversations(orgId, {
            channel,
            status,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    async getConversationById(orgId, id) {
        return this.inboxService.getConversationById(orgId, id);
    }
    async getMessages(orgId, id, limit) {
        return this.inboxService.getMessages(orgId, id, limit ? Number(limit) : 50);
    }
    async sendMessage(orgId, userId, id, dto) {
        return this.inboxService.sendMessage(orgId, id, userId, dto);
    }
    async toggleTakeover(orgId, userId, id, dto) {
        return this.inboxService.toggleTakeover(orgId, id, userId, dto);
    }
    async suggestReply(orgId, id) {
        return this.inboxService.suggestReply(orgId, id);
    }
    async updateConversation(orgId, userId, id, dto) {
        return this.inboxService.updateConversation(orgId, id, userId, dto);
    }
};
exports.InboxController = InboxController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('conversations'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INBOX_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List omnichannel conversation threads' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Query)('channel')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "listConversations", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('conversations/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INBOX_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation details and contact metadata' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "getConversationById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('conversations/:id/messages'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INBOX_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get chronological message history for a conversation thread' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "getMessages", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('conversations/:id/messages'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INBOX_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Send message reply to customer' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, inbox_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "sendMessage", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('conversations/:id/takeover'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INBOX_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle Human Agent Takeover vs Autonomous AI handling' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, inbox_dto_1.ToggleAiTakeoverDto]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "toggleTakeover", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('conversations/:id/suggest-reply'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INBOX_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI suggested reply draft' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "suggestReply", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Patch)('conversations/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.INBOX_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Update conversation status or assignment' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, inbox_dto_1.UpdateConversationDto]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "updateConversation", null);
exports.InboxController = InboxController = __decorate([
    (0, swagger_1.ApiTags)('Omnichannel Inbox'),
    (0, common_1.Controller)('inbox'),
    __metadata("design:paramtypes", [inbox_service_1.InboxService])
], InboxController);
//# sourceMappingURL=inbox.controller.js.map