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
exports.WorkflowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflows_service_1 = require("./workflows.service");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
const pagination_dto_1 = require("../../core/common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
let WorkflowsController = class WorkflowsController {
    workflowsService;
    constructor(workflowsService) {
        this.workflowsService = workflowsService;
    }
    async create(orgId, wsId, userId, dto) {
        return this.workflowsService.create(orgId, wsId, userId, dto);
    }
    async generateFromPrompt(orgId, wsId, userId, prompt) {
        return this.workflowsService.generateFromNaturalLanguage(orgId, wsId, userId, prompt);
    }
    async list(orgId, wsId, pagination) {
        return this.workflowsService.list(orgId, wsId, pagination);
    }
    async listExecutions(orgId, wsId, pagination) {
        return this.workflowsService.listExecutions(orgId, wsId, pagination);
    }
    async listDeadLetterQueue(orgId, wsId, pagination) {
        return this.workflowsService.listDeadLetterQueue(orgId, wsId, pagination);
    }
    async retryDeadLetterJob(executionId, orgId, wsId) {
        return this.workflowsService.retryDeadLetterJob(executionId, orgId, wsId);
    }
    async cancelDeadLetterJob(executionId, orgId, wsId) {
        return this.workflowsService.cancelDeadLetterJob(executionId, orgId, wsId);
    }
    async getExecutionById(executionId, orgId, wsId) {
        return this.workflowsService.getExecutionById(executionId, orgId, wsId);
    }
    async approveExecution(executionId, orgId, wsId, userId, reason) {
        return this.workflowsService.approveExecution(executionId, orgId, wsId, userId, reason);
    }
    async rejectExecution(executionId, orgId, wsId, userId, reason) {
        return this.workflowsService.rejectExecution(executionId, orgId, wsId, userId, reason);
    }
    async findById(id, orgId, wsId) {
        return this.workflowsService.findById(id, orgId, wsId);
    }
    async update(id, orgId, wsId, updates) {
        return this.workflowsService.update(id, orgId, wsId, updates);
    }
    async updateStatus(id, orgId, wsId, status) {
        return this.workflowsService.updateStatus(id, orgId, wsId, status);
    }
    async publish(id, orgId, wsId, userId, changelog) {
        return this.workflowsService.publish(id, orgId, wsId, userId, changelog);
    }
    async listVersions(id, orgId, wsId) {
        return this.workflowsService.listVersions(id, orgId, wsId);
    }
    async rollbackVersion(id, version, orgId, wsId, userId) {
        return this.workflowsService.rollbackVersion(id, parseInt(version, 10), orgId, wsId, userId);
    }
    async duplicate(id, orgId, wsId, userId, name) {
        return this.workflowsService.duplicate(id, orgId, wsId, userId, name);
    }
    async execute(id, orgId, wsId, userId, dto) {
        return this.workflowsService.triggerExecution(id, orgId, wsId, userId, dto);
    }
    async triggerByWebhook(webhookId, payload) {
        return this.workflowsService.triggerByWebhook(webhookId, payload);
    }
    async listDeadLetterJobs(orgId, status, workflowId, page, limit) {
        return this.workflowsService.getDeadLetterQueueService()?.listDeadLetterJobs(orgId, {
            status,
            workflowId,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }
    async getDeadLetterJob(orgId, id) {
        return this.workflowsService.getDeadLetterQueueService()?.getDeadLetterJob(orgId, id);
    }
    async replayDeadLetterJob(orgId, userId, id, customPayload) {
        return this.workflowsService.getDeadLetterQueueService()?.replayJob(orgId, id, userId, customPayload);
    }
    async dismissDeadLetterJob(orgId, userId, id) {
        return this.workflowsService.getDeadLetterQueueService()?.dismissJob(orgId, id, userId);
    }
};
exports.WorkflowsController = WorkflowsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new workflow' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_workflow_dto_1.CreateWorkflowDto]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('generate-from-prompt'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Generate structured workflow DAG from natural language instructions' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)('prompt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "generateFromPrompt", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List workflows with pagination and search' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('executions'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all workflow executions for workspace' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "listExecutions", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('dlq'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List dead-letter queue failed executions requiring operator review' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "listDeadLetterQueue", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('dlq/:executionId/retry'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_EXECUTE),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed dead-lettered workflow execution' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "retryDeadLetterJob", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('dlq/:executionId/cancel'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel/discard a failed dead-lettered workflow execution' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "cancelDeadLetterJob", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('executions/:executionId'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow execution details and node step traces' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "getExecutionById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('executions/:executionId/approve'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_EXECUTE),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a paused workflow execution and resume downstream nodes' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "approveExecution", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('executions/:executionId/reject'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_EXECUTE),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a paused workflow execution and cancel run' }),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "rejectExecution", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update workflow configuration and canvas graph' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update workflow status lifecycle (active, paused, disabled, archived)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "updateStatus", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/publish'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Publish an immutable workflow version and activate' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)('changelog')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "publish", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id/versions'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all historical published versions of this workflow' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "listVersions", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/versions/:version/rollback'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback draft canvas graph to a specific historical version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(3, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(4, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "rollbackVersion", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/duplicate'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate an existing workflow as a new draft' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "duplicate", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/execute'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_EXECUTE),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger a workflow execution manually' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, create_workflow_dto_1.TriggerExecutionDto]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "execute", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('trigger/webhook/:webhookId'),
    (0, swagger_1.ApiOperation)({ summary: 'Inbound public webhook trigger endpoint' }),
    __param(0, (0, common_1.Param)('webhookId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "triggerByWebhook", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('dlq/jobs'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List dead letter queue failed executions' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('workflowId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "listDeadLetterJobs", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('dlq/jobs/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of dead letter queue job' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "getDeadLetterJob", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('dlq/jobs/:id/replay'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_EXECUTE),
    (0, swagger_1.ApiOperation)({ summary: 'Replay dead letter job via BullMQ' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)('customPayload')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "replayDeadLetterJob", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('dlq/jobs/:id/dismiss'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Dismiss dead letter job' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "dismissDeadLetterJob", null);
exports.WorkflowsController = WorkflowsController = __decorate([
    (0, swagger_1.ApiTags)('Workflows & Executions'),
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [workflows_service_1.WorkflowsService])
], WorkflowsController);
//# sourceMappingURL=workflows.controller.js.map