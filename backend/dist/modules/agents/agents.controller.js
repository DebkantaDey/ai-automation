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
exports.AgentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agents_service_1 = require("./agents.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
const pagination_dto_1 = require("../../core/common/dto/pagination.dto");
let AgentsController = class AgentsController {
    agentsService;
    constructor(agentsService) {
        this.agentsService = agentsService;
    }
    async create(orgId, wsId, userId, dto) {
        return this.agentsService.createAgent(orgId, wsId, userId, dto);
    }
    async list(orgId, wsId, pagination) {
        return this.agentsService.listAgents(orgId, wsId, pagination);
    }
    async getById(id, orgId, wsId) {
        return this.agentsService.getAgentById(id, orgId, wsId);
    }
    async update(id, orgId, wsId, updates) {
        return this.agentsService.updateAgent(id, orgId, wsId, updates);
    }
    async delete(id, orgId, wsId) {
        await this.agentsService.deleteAgent(id, orgId, wsId);
        return { success: true };
    }
    async runAgent(id, orgId, wsId, userId, inputPrompt) {
        return this.agentsService.runAgent(id, orgId, wsId, userId, inputPrompt);
    }
    async listExecutions(id, orgId, wsId, pagination) {
        return this.agentsService.listExecutions(id, orgId, wsId, pagination);
    }
};
exports.AgentsController = AgentsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new autonomous AI agent' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all agents for current workspace' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent configuration and tools by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update agent instructions, tools, or limits' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Delete or archive agent' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/run'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_EXECUTE),
    (0, swagger_1.ApiOperation)({ summary: 'Execute autonomous agent ReAct loop with user input prompt' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)('inputPrompt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "runAgent", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id/executions'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List reasoning step executions for agent' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "listExecutions", null);
exports.AgentsController = AgentsController = __decorate([
    (0, swagger_1.ApiTags)('Autonomous AI Agents'),
    (0, common_1.Controller)('agents'),
    __metadata("design:paramtypes", [agents_service_1.AgentsService])
], AgentsController);
//# sourceMappingURL=agents.controller.js.map