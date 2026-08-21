"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const privacy_controller_1 = require("./privacy.controller");
const privacy_service_1 = require("./privacy.service");
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
let PrivacyModule = class PrivacyModule {
};
exports.PrivacyModule = PrivacyModule;
exports.PrivacyModule = PrivacyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: privacy_consent_schema_1.PrivacyConsent.name, schema: privacy_consent_schema_1.PrivacyConsentSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: organization_schema_1.Organization.name, schema: organization_schema_1.OrganizationSchema },
                { name: organization_member_schema_1.OrganizationMember.name, schema: organization_member_schema_1.OrganizationMemberSchema },
                { name: workspace_schema_1.Workspace.name, schema: workspace_schema_1.WorkspaceSchema },
                { name: workflow_schema_1.Workflow.name, schema: workflow_schema_1.WorkflowSchema },
                { name: workflow_execution_schema_1.WorkflowExecution.name, schema: workflow_execution_schema_1.WorkflowExecutionSchema },
                { name: api_key_schema_1.ApiKey.name, schema: api_key_schema_1.ApiKeySchema },
                { name: document_schema_1.Document.name, schema: document_schema_1.DocumentSchema },
                { name: document_chunk_schema_1.DocumentChunk.name, schema: document_chunk_schema_1.DocumentChunkSchema },
                { name: integration_connection_schema_1.IntegrationConnection.name, schema: integration_connection_schema_1.IntegrationConnectionSchema },
                { name: webhook_endpoint_schema_1.WebhookEndpoint.name, schema: webhook_endpoint_schema_1.WebhookEndpointSchema },
                { name: subscription_schema_1.Subscription.name, schema: subscription_schema_1.SubscriptionSchema },
                { name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
            ]),
        ],
        controllers: [privacy_controller_1.PrivacyController],
        providers: [privacy_service_1.PrivacyService],
        exports: [privacy_service_1.PrivacyService],
    })
], PrivacyModule);
//# sourceMappingURL=privacy.module.js.map