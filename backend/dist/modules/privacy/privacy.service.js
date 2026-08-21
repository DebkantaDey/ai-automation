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
var PrivacyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const privacy_consent_schema_1 = require("./schemas/privacy-consent.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const organization_schema_1 = require("../organizations/schemas/organization.schema");
const organization_member_schema_1 = require("../organizations/schemas/organization-member.schema");
const workspace_schema_1 = require("../workspaces/schemas/workspace.schema");
const workflow_schema_1 = require("../workflows/schemas/workflow.schema");
const workflow_execution_schema_1 = require("../workflows/schemas/workflow-execution.schema");
const api_key_schema_1 = require("../api-keys/schemas/api-key.schema");
const document_schema_1 = require("../knowledge-base/schemas/document.schema");
const document_chunk_schema_1 = require("../knowledge-base/schemas/document-chunk.schema");
const integration_connection_schema_1 = require("../integrations/schemas/integration-connection.schema");
const webhook_endpoint_schema_1 = require("../webhooks/schemas/webhook-endpoint.schema");
const subscription_schema_1 = require("../billing/schemas/subscription.schema");
const audit_log_schema_1 = require("../audit-logs/schemas/audit-log.schema");
let PrivacyService = PrivacyService_1 = class PrivacyService {
    consentModel;
    userModel;
    orgModel;
    membershipModel;
    workspaceModel;
    workflowModel;
    executionModel;
    apiKeyModel;
    documentModel;
    chunkModel;
    integrationModel;
    webhookModel;
    subscriptionModel;
    auditLogModel;
    logger = new common_1.Logger(PrivacyService_1.name);
    constructor(consentModel, userModel, orgModel, membershipModel, workspaceModel, workflowModel, executionModel, apiKeyModel, documentModel, chunkModel, integrationModel, webhookModel, subscriptionModel, auditLogModel) {
        this.consentModel = consentModel;
        this.userModel = userModel;
        this.orgModel = orgModel;
        this.membershipModel = membershipModel;
        this.workspaceModel = workspaceModel;
        this.workflowModel = workflowModel;
        this.executionModel = executionModel;
        this.apiKeyModel = apiKeyModel;
        this.documentModel = documentModel;
        this.chunkModel = chunkModel;
        this.integrationModel = integrationModel;
        this.webhookModel = webhookModel;
        this.subscriptionModel = subscriptionModel;
        this.auditLogModel = auditLogModel;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async exportUserData(userId) {
        const userObjId = this.toObjectId(userId);
        const user = await this.userModel.findById(userObjId).lean();
        if (!user) {
            throw new common_1.NotFoundException(`User [${userId}] not found`);
        }
        const memberships = await this.membershipModel
            .find({ userId: userObjId })
            .populate('organizationId', 'name slug')
            .lean();
        const consent = await this.consentModel.findOne({ userId: userObjId }).lean();
        const { password, ...sanitizedProfile } = user;
        return {
            exportVersion: '1.0',
            exportedAt: new Date().toISOString(),
            subject: 'GDPR / CCPA User Data Portability Package',
            profile: sanitizedProfile,
            organizationMemberships: memberships,
            privacyConsent: consent || { analyticsConsent: true, marketingConsent: false },
        };
    }
    async exportOrganizationData(organizationId) {
        const orgObjId = this.toObjectId(organizationId);
        const org = await this.orgModel.findById(orgObjId).lean();
        if (!org) {
            throw new common_1.NotFoundException(`Organization [${organizationId}] not found`);
        }
        const workspaces = await this.workspaceModel.find({ organizationId: orgObjId }).lean();
        const workflows = await this.workflowModel.find({ organizationId: orgObjId }).lean();
        const executionStats = await this.executionModel.find({ organizationId: orgObjId }).limit(100).lean();
        const documents = await this.documentModel.find({ organizationId: orgObjId }).select('-rawContent').lean();
        const apiKeys = await this.apiKeyModel.find({ organizationId: orgObjId }).select('-keyHash').lean();
        const subscription = await this.subscriptionModel.findOne({ organizationId: orgObjId }).lean();
        return {
            exportVersion: '1.0',
            exportedAt: new Date().toISOString(),
            organization: org,
            workspaces,
            workflows,
            recentExecutions: executionStats,
            knowledgeBaseDocuments: documents,
            apiKeysConfigured: apiKeys,
            subscription,
        };
    }
    async deleteUserAccount(userId) {
        const userObjId = this.toObjectId(userId);
        await this.membershipModel.deleteMany({ userId: userObjId });
        await this.consentModel.deleteMany({ userId: userObjId });
        const deleted = await this.userModel.findByIdAndDelete(userObjId);
        if (!deleted) {
            throw new common_1.NotFoundException(`User [${userId}] not found`);
        }
        this.logger.log(`[Privacy] Permanently deleted user account [${userId}]`);
        return { success: true, message: 'User account and associated profile permanently deleted.' };
    }
    async deleteOrganization(organizationId) {
        const orgObjId = this.toObjectId(organizationId);
        const org = await this.orgModel.findById(orgObjId);
        if (!org) {
            throw new common_1.NotFoundException(`Organization [${organizationId}] not found`);
        }
        const [workspaces, workflows, executions, docs, chunks, keys, integrations, webhooks, subs, memberships, audits,] = await Promise.all([
            this.workspaceModel.deleteMany({ organizationId: orgObjId }),
            this.workflowModel.deleteMany({ organizationId: orgObjId }),
            this.executionModel.deleteMany({ organizationId: orgObjId }),
            this.documentModel.deleteMany({ organizationId: orgObjId }),
            this.chunkModel.deleteMany({ organizationId: orgObjId }),
            this.apiKeyModel.deleteMany({ organizationId: orgObjId }),
            this.integrationModel.deleteMany({ organizationId: orgObjId }),
            this.webhookModel.deleteMany({ organizationId: orgObjId }),
            this.subscriptionModel.deleteMany({ organizationId: orgObjId }),
            this.membershipModel.deleteMany({ organizationId: orgObjId }),
            this.auditLogModel.deleteMany({ organizationId: orgObjId }),
        ]);
        await this.orgModel.findByIdAndDelete(orgObjId);
        const counts = {
            workspaces: workspaces.deletedCount,
            workflows: workflows.deletedCount,
            executions: executions.deletedCount,
            documents: docs.deletedCount,
            chunks: chunks.deletedCount,
            apiKeys: keys.deletedCount,
            integrations: integrations.deletedCount,
            webhooks: webhooks.deletedCount,
            subscriptions: subs.deletedCount,
            memberships: memberships.deletedCount,
            auditLogs: audits.deletedCount,
        };
        this.logger.log(`[Privacy] Cascaded deletion for Organization [${organizationId}]: ${JSON.stringify(counts)}`);
        return { success: true, deletedCounts: counts };
    }
    async getConsent(userId) {
        return this.consentModel.findOne({ userId: this.toObjectId(userId) });
    }
    async updateConsent(userId, dto) {
        const userObjId = this.toObjectId(userId);
        return this.consentModel.findOneAndUpdate({ userId: userObjId }, {
            ...dto,
            consentTimestamp: new Date(),
        }, { upsert: true, new: true });
    }
};
exports.PrivacyService = PrivacyService;
exports.PrivacyService = PrivacyService = PrivacyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(privacy_consent_schema_1.PrivacyConsent.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(organization_schema_1.Organization.name)),
    __param(3, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __param(4, (0, mongoose_1.InjectModel)(workspace_schema_1.Workspace.name)),
    __param(5, (0, mongoose_1.InjectModel)(workflow_schema_1.Workflow.name)),
    __param(6, (0, mongoose_1.InjectModel)(workflow_execution_schema_1.WorkflowExecution.name)),
    __param(7, (0, mongoose_1.InjectModel)(api_key_schema_1.ApiKey.name)),
    __param(8, (0, mongoose_1.InjectModel)(document_schema_1.Document.name)),
    __param(9, (0, mongoose_1.InjectModel)(document_chunk_schema_1.DocumentChunk.name)),
    __param(10, (0, mongoose_1.InjectModel)(integration_connection_schema_1.IntegrationConnection.name)),
    __param(11, (0, mongoose_1.InjectModel)(webhook_endpoint_schema_1.WebhookEndpoint.name)),
    __param(12, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __param(13, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PrivacyService);
//# sourceMappingURL=privacy.service.js.map