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
exports.KnowledgeBaseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const knowledge_base_service_1 = require("./knowledge-base.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
const pagination_dto_1 = require("../../core/common/dto/pagination.dto");
let KnowledgeBaseController = class KnowledgeBaseController {
    kbService;
    constructor(kbService) {
        this.kbService = kbService;
    }
    async create(orgId, wsId, userId, dto) {
        return this.kbService.createKnowledgeBase(orgId, wsId, userId, dto);
    }
    async list(orgId, wsId, pagination) {
        return this.kbService.listKnowledgeBases(orgId, wsId, pagination);
    }
    async getById(id, orgId, wsId) {
        return this.kbService.getKnowledgeBaseById(id, orgId, wsId);
    }
    async addDocument(id, orgId, wsId, userId, dto) {
        return this.kbService.addDocument(id, orgId, wsId, userId, dto);
    }
    async listDocuments(id, orgId, wsId, pagination) {
        return this.kbService.listDocuments(id, orgId, wsId, pagination);
    }
    async askQuestion(id, orgId, wsId, question) {
        return this.kbService.askQuestion(id, orgId, wsId, question);
    }
};
exports.KnowledgeBaseController = KnowledgeBaseController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new knowledge base collection' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List all knowledge bases in workspace' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get knowledge base details and document counts' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "getById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/documents'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Add document and enqueue background chunking & vector indexing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "addDocument", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)(':id/documents'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'List documents and indexing statuses for knowledge base' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, pagination_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "listDocuments", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)(':id/query'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.WORKFLOW_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Ask question with vector similarity retrieval and RAG synthesis' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(2, (0, tenant_decorators_1.CurrentWorkspaceId)()),
    __param(3, (0, common_1.Body)('question')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "askQuestion", null);
exports.KnowledgeBaseController = KnowledgeBaseController = __decorate([
    (0, swagger_1.ApiTags)('Knowledge Base & Vector RAG'),
    (0, common_1.Controller)('knowledge-base'),
    __metadata("design:paramtypes", [knowledge_base_service_1.KnowledgeBaseService])
], KnowledgeBaseController);
//# sourceMappingURL=knowledge-base.controller.js.map