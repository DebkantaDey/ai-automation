import { Model } from 'mongoose';
import { PrivacyConsent, PrivacyConsentDocument } from './schemas/privacy-consent.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { OrganizationDocument } from '../organizations/schemas/organization.schema';
import { OrganizationMemberDocument } from '../organizations/schemas/organization-member.schema';
import { WorkspaceDocument } from '../workspaces/schemas/workspace.schema';
import { WorkflowDocument } from '../workflows/schemas/workflow.schema';
import { WorkflowExecutionDocument } from '../workflows/schemas/workflow-execution.schema';
import { ApiKeyDocument } from '../api-keys/schemas/api-key.schema';
import { DocumentDocument as KbDocumentDocument } from '../knowledge-base/schemas/document.schema';
import { DocumentChunkDocument } from '../knowledge-base/schemas/document-chunk.schema';
import { IntegrationConnectionDocument } from '../integrations/schemas/integration-connection.schema';
import { WebhookEndpointDocument } from '../webhooks/schemas/webhook-endpoint.schema';
import { SubscriptionDocument } from '../billing/schemas/subscription.schema';
import { AuditLogDocument } from '../audit-logs/schemas/audit-log.schema';
export declare class PrivacyService {
    private readonly consentModel;
    private readonly userModel;
    private readonly orgModel;
    private readonly membershipModel;
    private readonly workspaceModel;
    private readonly workflowModel;
    private readonly executionModel;
    private readonly apiKeyModel;
    private readonly documentModel;
    private readonly chunkModel;
    private readonly integrationModel;
    private readonly webhookModel;
    private readonly subscriptionModel;
    private readonly auditLogModel;
    private readonly logger;
    constructor(consentModel: Model<PrivacyConsentDocument>, userModel: Model<UserDocument>, orgModel: Model<OrganizationDocument>, membershipModel: Model<OrganizationMemberDocument>, workspaceModel: Model<WorkspaceDocument>, workflowModel: Model<WorkflowDocument>, executionModel: Model<WorkflowExecutionDocument>, apiKeyModel: Model<ApiKeyDocument>, documentModel: Model<KbDocumentDocument>, chunkModel: Model<DocumentChunkDocument>, integrationModel: Model<IntegrationConnectionDocument>, webhookModel: Model<WebhookEndpointDocument>, subscriptionModel: Model<SubscriptionDocument>, auditLogModel: Model<AuditLogDocument>);
    private toObjectId;
    exportUserData(userId: string): Promise<Record<string, any>>;
    exportOrganizationData(organizationId: string): Promise<Record<string, any>>;
    deleteUserAccount(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteOrganization(organizationId: string): Promise<{
        success: boolean;
        deletedCounts: Record<string, number>;
    }>;
    getConsent(userId: string): Promise<PrivacyConsent | null>;
    updateConsent(userId: string, dto: {
        analyticsConsent?: boolean;
        marketingConsent?: boolean;
        dataProcessingConsent?: boolean;
        ipAddress?: string;
    }): Promise<PrivacyConsent>;
}
