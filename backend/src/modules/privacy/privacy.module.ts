import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';
import { PrivacyConsent, PrivacyConsentSchema } from './schemas/privacy-consent.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Organization, OrganizationSchema } from '../organizations/schemas/organization.schema';
import { OrganizationMember, OrganizationMemberSchema } from '../organizations/schemas/organization-member.schema';
import { Workspace, WorkspaceSchema } from '../workspaces/schemas/workspace.schema';
import { Workflow, WorkflowSchema } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionSchema } from '../workflows/schemas/workflow-execution.schema';
import { ApiKey, ApiKeySchema } from '../api-keys/schemas/api-key.schema';
import { Document as KbDoc, DocumentSchema as KbDocSchema } from '../knowledge-base/schemas/document.schema';
import { DocumentChunk, DocumentChunkSchema } from '../knowledge-base/schemas/document-chunk.schema';
import { IntegrationConnection, IntegrationConnectionSchema } from '../integrations/schemas/integration-connection.schema';
import { WebhookEndpoint, WebhookEndpointSchema } from '../webhooks/schemas/webhook-endpoint.schema';
import { Subscription, SubscriptionSchema } from '../billing/schemas/subscription.schema';
import { AuditLog, AuditLogSchema } from '../audit-logs/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrivacyConsent.name, schema: PrivacyConsentSchema },
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Workflow.name, schema: WorkflowSchema },
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: KbDoc.name, schema: KbDocSchema },
      { name: DocumentChunk.name, schema: DocumentChunkSchema },
      { name: IntegrationConnection.name, schema: IntegrationConnectionSchema },
      { name: WebhookEndpoint.name, schema: WebhookEndpointSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [PrivacyController],
  providers: [PrivacyService],
  exports: [PrivacyService],
})
export class PrivacyModule {}
