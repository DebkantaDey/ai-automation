import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PrivacyConsent, PrivacyConsentDocument } from './schemas/privacy-consent.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Organization, OrganizationDocument } from '../organizations/schemas/organization.schema';
import { OrganizationMember, OrganizationMemberDocument } from '../organizations/schemas/organization-member.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/schemas/workspace.schema';
import { Workflow, WorkflowDocument } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from '../workflows/schemas/workflow-execution.schema';
import { ApiKey, ApiKeyDocument } from '../api-keys/schemas/api-key.schema';
import { Document as KbDocument, DocumentDocument as KbDocumentDocument } from '../knowledge-base/schemas/document.schema';
import { DocumentChunk, DocumentChunkDocument } from '../knowledge-base/schemas/document-chunk.schema';
import { IntegrationConnection, IntegrationConnectionDocument } from '../integrations/schemas/integration-connection.schema';
import { WebhookEndpoint, WebhookEndpointDocument } from '../webhooks/schemas/webhook-endpoint.schema';
import { Subscription, SubscriptionDocument } from '../billing/schemas/subscription.schema';
import { AuditLog, AuditLogDocument } from '../audit-logs/schemas/audit-log.schema';

@Injectable()
export class PrivacyService {
  private readonly logger = new Logger(PrivacyService.name);

  constructor(
    @InjectModel(PrivacyConsent.name) private readonly consentModel: Model<PrivacyConsentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name) private readonly membershipModel: Model<OrganizationMemberDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(Workflow.name) private readonly workflowModel: Model<WorkflowDocument>,
    @InjectModel(WorkflowExecution.name) private readonly executionModel: Model<WorkflowExecutionDocument>,
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKeyDocument>,
    @InjectModel(KbDocument.name) private readonly documentModel: Model<KbDocumentDocument>,
    @InjectModel(DocumentChunk.name) private readonly chunkModel: Model<DocumentChunkDocument>,
    @InjectModel(IntegrationConnection.name) private readonly integrationModel: Model<IntegrationConnectionDocument>,
    @InjectModel(WebhookEndpoint.name) private readonly webhookModel: Model<WebhookEndpointDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  // 1. GDPR Data Portability Export - User Account
  async exportUserData(userId: string): Promise<Record<string, any>> {
    const userObjId = this.toObjectId(userId);
    const user = await this.userModel.findById(userObjId).lean();

    if (!user) {
      throw new NotFoundException(`User [${userId}] not found`);
    }

    const memberships = await this.membershipModel
      .find({ userId: userObjId })
      .populate('organizationId', 'name slug')
      .lean();

    const consent = await this.consentModel.findOne({ userId: userObjId }).lean();

    // Sanitize sensitive credentials
    const { password, ...sanitizedProfile } = user as any;

    return {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      subject: 'GDPR / CCPA User Data Portability Package',
      profile: sanitizedProfile,
      organizationMemberships: memberships,
      privacyConsent: consent || { analyticsConsent: true, marketingConsent: false },
    };
  }

  // 2. GDPR Data Portability Export - Organization Data
  async exportOrganizationData(organizationId: string): Promise<Record<string, any>> {
    const orgObjId = this.toObjectId(organizationId);
    const org = await this.orgModel.findById(orgObjId).lean();

    if (!org) {
      throw new NotFoundException(`Organization [${organizationId}] not found`);
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

  // 3. Right to be Forgotten - User Account Deletion
  async deleteUserAccount(userId: string): Promise<{ success: boolean; message: string }> {
    const userObjId = this.toObjectId(userId);

    // Remove user memberships
    await this.membershipModel.deleteMany({ userId: userObjId });
    // Remove consent records
    await this.consentModel.deleteMany({ userId: userObjId });
    // Delete user
    const deleted = await this.userModel.findByIdAndDelete(userObjId);

    if (!deleted) {
      throw new NotFoundException(`User [${userId}] not found`);
    }

    this.logger.log(`[Privacy] Permanently deleted user account [${userId}]`);
    return { success: true, message: 'User account and associated profile permanently deleted.' };
  }

  // 4. Complete Cascading Organization Deletion
  async deleteOrganization(organizationId: string): Promise<{ success: boolean; deletedCounts: Record<string, number> }> {
    const orgObjId = this.toObjectId(organizationId);

    const org = await this.orgModel.findById(orgObjId);
    if (!org) {
      throw new NotFoundException(`Organization [${organizationId}] not found`);
    }

    const [
      workspaces,
      workflows,
      executions,
      docs,
      chunks,
      keys,
      integrations,
      webhooks,
      subs,
      memberships,
      audits,
    ] = await Promise.all([
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

  // 5. Consent Management
  async getConsent(userId: string): Promise<PrivacyConsent | null> {
    return this.consentModel.findOne({ userId: this.toObjectId(userId) });
  }

  async updateConsent(
    userId: string,
    dto: { analyticsConsent?: boolean; marketingConsent?: boolean; dataProcessingConsent?: boolean; ipAddress?: string },
  ): Promise<PrivacyConsent> {
    const userObjId = this.toObjectId(userId);
    return this.consentModel.findOneAndUpdate(
      { userId: userObjId },
      {
        ...dto,
        consentTimestamp: new Date(),
      },
      { upsert: true, new: true },
    );
  }
}
