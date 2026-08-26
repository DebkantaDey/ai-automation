"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const config_2 = require("./core/config");
const database_module_1 = require("./core/database/database.module");
const tenancy_module_1 = require("./core/tenancy/tenancy.module");
const queue_module_1 = require("./core/queue/queue.module");
const auth_module_1 = require("./core/auth/auth.module");
const events_module_1 = require("./core/events/events.module");
const ai_module_1 = require("./integrations/ai/ai.module");
const storage_module_1 = require("./integrations/storage/storage.module");
const billing_module_1 = require("./integrations/billing/billing.module");
const users_module_1 = require("./modules/users/users.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const roles_module_1 = require("./modules/roles/roles.module");
const workspaces_module_1 = require("./modules/workspaces/workspaces.module");
const workflows_module_1 = require("./modules/workflows/workflows.module");
const agents_module_1 = require("./modules/agents/agents.module");
const knowledge_base_module_1 = require("./modules/knowledge-base/knowledge-base.module");
const templates_module_1 = require("./modules/templates/templates.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const api_keys_module_1 = require("./modules/api-keys/api-keys.module");
const admin_module_1 = require("./modules/admin/admin.module");
const events_stream_module_1 = require("./modules/events-stream/events-stream.module");
const privacy_module_1 = require("./modules/privacy/privacy.module");
const billing_module_2 = require("./modules/billing/billing.module");
const integrations_module_1 = require("./modules/integrations/integrations.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const health_module_1 = require("./modules/health/health.module");
const crm_module_1 = require("./modules/crm/crm.module");
const inbox_module_1 = require("./modules/inbox/inbox.module");
const calendar_module_1 = require("./modules/calendar/calendar.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const env_validation_1 = require("./core/config/env-validation");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: config_2.appConfigurations,
                validate: env_validation_1.validateEnvironment,
                envFilePath: ['.env.local', '.env'],
            }),
            database_module_1.DatabaseModule,
            tenancy_module_1.TenancyModule,
            queue_module_1.QueueModule,
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
            ai_module_1.AiModule,
            storage_module_1.StorageModule,
            billing_module_1.BillingModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            roles_module_1.RolesModule,
            workspaces_module_1.WorkspacesModule,
            workflows_module_1.WorkflowsModule,
            agents_module_1.AgentsModule,
            knowledge_base_module_1.KnowledgeBaseModule,
            templates_module_1.TemplatesModule,
            notifications_module_1.NotificationsModule,
            analytics_module_1.AnalyticsModule,
            api_keys_module_1.ApiKeysModule,
            admin_module_1.AdminModule,
            events_stream_module_1.EventsStreamModule,
            privacy_module_1.PrivacyModule,
            billing_module_2.BillingModule,
            integrations_module_1.IntegrationsModule,
            webhooks_module_1.WebhooksModule,
            audit_logs_module_1.AuditLogsModule,
            health_module_1.HealthModule,
            crm_module_1.CrmModule,
            inbox_module_1.InboxModule,
            calendar_module_1.CalendarModule,
            tasks_module_1.TasksModule,
            invoices_module_1.InvoicesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map