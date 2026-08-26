import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigurations } from './core/config';
import { DatabaseModule } from './core/database/database.module';
import { TenancyModule } from './core/tenancy/tenancy.module';
import { QueueModule } from './core/queue/queue.module';
import { AuthModule } from './core/auth/auth.module';
import { EventsModule } from './core/events/events.module';
import { AiModule } from './integrations/ai/ai.module';
import { StorageModule } from './integrations/storage/storage.module';
import { BillingModule as VendorBillingModule } from './integrations/billing/billing.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RolesModule } from './modules/roles/roles.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AgentsModule } from './modules/agents/agents.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { AdminModule } from './modules/admin/admin.module';
import { EventsStreamModule } from './modules/events-stream/events-stream.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { BillingModule as SaaSBillingModule } from './modules/billing/billing.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { HealthModule } from './modules/health/health.module';
import { CrmModule } from './modules/crm/crm.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

import { validateEnvironment } from './core/config/env-validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: appConfigurations,
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),

    // Core Infrastructure
    DatabaseModule,
    TenancyModule,
    QueueModule,
    AuthModule,
    EventsModule,

    // Vendor Abstraction Gateways
    AiModule,
    StorageModule,
    VendorBillingModule,

    // Domain Modules
    UsersModule,
    OrganizationsModule,
    RolesModule,
    WorkspacesModule,
    WorkflowsModule,
    AgentsModule,
    KnowledgeBaseModule,
    TemplatesModule,
    NotificationsModule,
    AnalyticsModule,
    ApiKeysModule,
    AdminModule,
    EventsStreamModule,
    PrivacyModule,
    SaaSBillingModule,
    IntegrationsModule,
    WebhooksModule,
    AuditLogsModule,
    HealthModule,
    CrmModule,
    InboxModule,
    CalendarModule,
    TasksModule,
    InvoicesModule,
  ],
})
export class AppModule {}
