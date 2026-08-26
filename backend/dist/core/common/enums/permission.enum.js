"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRolePermissions = exports.PERMISSION_DEFINITIONS = exports.ALL_PERMISSIONS = exports.Permission = void 0;
var Permission;
(function (Permission) {
    Permission["ORGANIZATION_READ"] = "organization.read";
    Permission["ORGANIZATION_UPDATE"] = "organization.update";
    Permission["ORGANIZATION_DELETE"] = "organization.delete";
    Permission["WORKSPACE_READ"] = "workspace.read";
    Permission["WORKSPACE_CREATE"] = "workspace.create";
    Permission["WORKSPACE_UPDATE"] = "workspace.update";
    Permission["WORKSPACE_DELETE"] = "workspace.delete";
    Permission["WORKSPACE_ARCHIVE"] = "workspace.archive";
    Permission["MEMBERS_READ"] = "members.read";
    Permission["MEMBERS_INVITE"] = "members.invite";
    Permission["MEMBERS_UPDATE"] = "members.update";
    Permission["MEMBERS_REMOVE"] = "members.remove";
    Permission["ROLES_READ"] = "roles.read";
    Permission["ROLES_CREATE"] = "roles.create";
    Permission["ROLES_UPDATE"] = "roles.update";
    Permission["ROLES_DELETE"] = "roles.delete";
    Permission["WORKFLOW_READ"] = "workflow.read";
    Permission["WORKFLOW_CREATE"] = "workflow.create";
    Permission["WORKFLOW_UPDATE"] = "workflow.update";
    Permission["WORKFLOW_DELETE"] = "workflow.delete";
    Permission["WORKFLOW_EXECUTE"] = "workflow.execute";
    Permission["INTEGRATION_READ"] = "integration.read";
    Permission["INTEGRATION_CONNECT"] = "integration.connect";
    Permission["INTEGRATION_UPDATE"] = "integration.update";
    Permission["INTEGRATION_DELETE"] = "integration.delete";
    Permission["AI_READ"] = "ai.read";
    Permission["AI_EXECUTE"] = "ai.execute";
    Permission["AI_MANAGE"] = "ai.manage";
    Permission["ANALYTICS_READ"] = "analytics.read";
    Permission["BILLING_READ"] = "billing.read";
    Permission["BILLING_MANAGE"] = "billing.manage";
    Permission["API_READ"] = "api.read";
    Permission["API_MANAGE"] = "api.manage";
    Permission["AUDIT_READ"] = "audit.read";
    Permission["CRM_READ"] = "crm.read";
    Permission["CRM_WRITE"] = "crm.write";
    Permission["CRM_DELETE"] = "crm.delete";
    Permission["DEALS_MANAGE"] = "deals.manage";
    Permission["INBOX_READ"] = "inbox.read";
    Permission["INBOX_WRITE"] = "inbox.write";
    Permission["CALENDAR_READ"] = "calendar.read";
    Permission["CALENDAR_WRITE"] = "calendar.write";
    Permission["TASKS_READ"] = "tasks.read";
    Permission["TASKS_WRITE"] = "tasks.write";
    Permission["INVOICES_READ"] = "invoices.read";
    Permission["INVOICES_WRITE"] = "invoices.write";
})(Permission || (exports.Permission = Permission = {}));
exports.ALL_PERMISSIONS = Object.values(Permission);
exports.PERMISSION_DEFINITIONS = [
    { key: Permission.ORGANIZATION_READ, category: 'organization', label: 'View Organization', description: 'View organization profile and settings' },
    { key: Permission.ORGANIZATION_UPDATE, category: 'organization', label: 'Update Organization', description: 'Update organization name, localization, and branding' },
    { key: Permission.ORGANIZATION_DELETE, category: 'organization', label: 'Delete Organization', description: 'Permanently delete organization and tenant data' },
    { key: Permission.WORKSPACE_READ, category: 'workspace', label: 'View Workspaces', description: 'View workspaces and workspace settings' },
    { key: Permission.WORKSPACE_CREATE, category: 'workspace', label: 'Create Workspaces', description: 'Create new departmental or project workspaces' },
    { key: Permission.WORKSPACE_UPDATE, category: 'workspace', label: 'Edit Workspaces', description: 'Update workspace metadata, color, and preferences' },
    { key: Permission.WORKSPACE_DELETE, category: 'workspace', label: 'Delete Workspaces', description: 'Delete non-default workspaces and contained resources' },
    { key: Permission.WORKSPACE_ARCHIVE, category: 'workspace', label: 'Archive Workspaces', description: 'Archive workspaces to prevent execution' },
    { key: Permission.MEMBERS_READ, category: 'members', label: 'View Members', description: 'View organization member list and invitations' },
    { key: Permission.MEMBERS_INVITE, category: 'members', label: 'Invite Members', description: 'Invite new team members to the organization' },
    { key: Permission.MEMBERS_UPDATE, category: 'members', label: 'Update Member Roles', description: 'Modify member roles and access levels' },
    { key: Permission.MEMBERS_REMOVE, category: 'members', label: 'Remove Members', description: 'Remove team members from the organization' },
    { key: Permission.ROLES_READ, category: 'roles', label: 'View Roles', description: 'View system and custom roles' },
    { key: Permission.ROLES_CREATE, category: 'roles', label: 'Create Roles', description: 'Create custom roles with custom permission sets' },
    { key: Permission.ROLES_UPDATE, category: 'roles', label: 'Update Roles', description: 'Modify permissions and descriptions of custom roles' },
    { key: Permission.ROLES_DELETE, category: 'roles', label: 'Delete Roles', description: 'Delete custom roles that are not assigned to members' },
    { key: Permission.WORKFLOW_READ, category: 'workflow', label: 'View Workflows', description: 'View automated workflows and execution history' },
    { key: Permission.WORKFLOW_CREATE, category: 'workflow', label: 'Create Workflows', description: 'Create new automation workflows' },
    { key: Permission.WORKFLOW_UPDATE, category: 'workflow', label: 'Edit Workflows', description: 'Modify workflow graph nodes, triggers, and configurations' },
    { key: Permission.WORKFLOW_DELETE, category: 'workflow', label: 'Delete Workflows', description: 'Remove automated workflows' },
    { key: Permission.WORKFLOW_EXECUTE, category: 'workflow', label: 'Execute Workflows', description: 'Trigger and run workflows manually or via API' },
    { key: Permission.INTEGRATION_READ, category: 'integration', label: 'View Integrations', description: 'View connected external services and webhook endpoints' },
    { key: Permission.INTEGRATION_CONNECT, category: 'integration', label: 'Connect Integrations', description: 'Connect third-party apps and OAuth services' },
    { key: Permission.INTEGRATION_UPDATE, category: 'integration', label: 'Manage Integrations', description: 'Configure integration credentials and webhook events' },
    { key: Permission.INTEGRATION_DELETE, category: 'integration', label: 'Disconnect Integrations', description: 'Remove app connections and credentials' },
    { key: Permission.AI_READ, category: 'ai', label: 'View AI Agents', description: 'View AI agent configurations and model usage' },
    { key: Permission.AI_EXECUTE, category: 'ai', label: 'Execute AI Tasks', description: 'Run prompt completions and AI agent workflows' },
    { key: Permission.AI_MANAGE, category: 'ai', label: 'Manage AI Agents', description: 'Create, update, and configure autonomous AI agents' },
    { key: Permission.ANALYTICS_READ, category: 'analytics', label: 'View Analytics', description: 'View automation execution metrics and performance dashboards' },
    { key: Permission.BILLING_READ, category: 'billing', label: 'View Billing', description: 'View subscription plan, invoices, and usage' },
    { key: Permission.BILLING_MANAGE, category: 'billing', label: 'Manage Billing', description: 'Upgrade subscription, manage payment methods, and invoices' },
    { key: Permission.API_READ, category: 'api', label: 'View API Keys', description: 'View API keys and developer documentation' },
    { key: Permission.API_MANAGE, category: 'api', label: 'Manage API Keys', description: 'Generate and revoke organization API keys' },
    { key: Permission.AUDIT_READ, category: 'audit', label: 'View Audit Logs', description: 'View security audit trails and member activity history' },
    { key: Permission.CRM_READ, category: 'organization', label: 'View CRM', description: 'View leads, customers, and pipeline deals' },
    { key: Permission.CRM_WRITE, category: 'organization', label: 'Manage CRM', description: 'Create and update leads, customers, and deals' },
    { key: Permission.CRM_DELETE, category: 'organization', label: 'Delete CRM Records', description: 'Remove leads, customers, and deals' },
    { key: Permission.DEALS_MANAGE, category: 'organization', label: 'Manage Deals', description: 'Modify deal pipeline stages and values' },
    { key: Permission.INBOX_READ, category: 'organization', label: 'View Inbox', description: 'View omnichannel message threads and customer chats' },
    { key: Permission.INBOX_WRITE, category: 'organization', label: 'Reply in Inbox', description: 'Send messages, take over conversations, and trigger AI drafts' },
    { key: Permission.CALENDAR_READ, category: 'organization', label: 'View Calendar', description: 'View appointments and booking schedules' },
    { key: Permission.CALENDAR_WRITE, category: 'organization', label: 'Manage Calendar', description: 'Book, reschedule, and manage appointment slots' },
    { key: Permission.TASKS_READ, category: 'organization', label: 'View Tasks', description: 'View assigned operational tasks' },
    { key: Permission.TASKS_WRITE, category: 'organization', label: 'Manage Tasks', description: 'Create, update, and complete operational tasks' },
    { key: Permission.INVOICES_READ, category: 'billing', label: 'View Invoices', description: 'View customer invoices and payment ledger' },
    { key: Permission.INVOICES_WRITE, category: 'billing', label: 'Manage Invoices', description: 'Create invoices and process payments' },
];
exports.SystemRolePermissions = {
    owner: ['*'],
    admin: exports.ALL_PERMISSIONS.filter((p) => p !== Permission.ORGANIZATION_DELETE),
    manager: [
        Permission.ORGANIZATION_READ,
        Permission.WORKSPACE_READ,
        Permission.WORKSPACE_CREATE,
        Permission.WORKSPACE_UPDATE,
        Permission.MEMBERS_READ,
        Permission.ROLES_READ,
        Permission.CRM_READ,
        Permission.CRM_WRITE,
        Permission.CRM_DELETE,
        Permission.DEALS_MANAGE,
        Permission.INBOX_READ,
        Permission.INBOX_WRITE,
        Permission.CALENDAR_READ,
        Permission.CALENDAR_WRITE,
        Permission.TASKS_READ,
        Permission.TASKS_WRITE,
        Permission.INVOICES_READ,
        Permission.INVOICES_WRITE,
        Permission.WORKFLOW_READ,
        Permission.WORKFLOW_CREATE,
        Permission.WORKFLOW_UPDATE,
        Permission.WORKFLOW_DELETE,
        Permission.WORKFLOW_EXECUTE,
        Permission.INTEGRATION_READ,
        Permission.INTEGRATION_CONNECT,
        Permission.INTEGRATION_UPDATE,
        Permission.AI_READ,
        Permission.AI_EXECUTE,
        Permission.AI_MANAGE,
        Permission.ANALYTICS_READ,
        Permission.API_READ,
        Permission.AUDIT_READ,
    ],
    operator: [
        Permission.ORGANIZATION_READ,
        Permission.WORKSPACE_READ,
        Permission.MEMBERS_READ,
        Permission.CRM_READ,
        Permission.CRM_WRITE,
        Permission.DEALS_MANAGE,
        Permission.INBOX_READ,
        Permission.INBOX_WRITE,
        Permission.CALENDAR_READ,
        Permission.CALENDAR_WRITE,
        Permission.TASKS_READ,
        Permission.TASKS_WRITE,
        Permission.INVOICES_READ,
        Permission.WORKFLOW_READ,
        Permission.WORKFLOW_EXECUTE,
        Permission.INTEGRATION_READ,
        Permission.AI_READ,
        Permission.AI_EXECUTE,
        Permission.ANALYTICS_READ,
    ],
    viewer: [
        Permission.ORGANIZATION_READ,
        Permission.WORKSPACE_READ,
        Permission.MEMBERS_READ,
        Permission.CRM_READ,
        Permission.INBOX_READ,
        Permission.CALENDAR_READ,
        Permission.TASKS_READ,
        Permission.INVOICES_READ,
        Permission.WORKFLOW_READ,
        Permission.INTEGRATION_READ,
        Permission.AI_READ,
        Permission.ANALYTICS_READ,
        Permission.AUDIT_READ,
    ],
    member: [
        Permission.ORGANIZATION_READ,
        Permission.WORKSPACE_READ,
        Permission.WORKSPACE_CREATE,
        Permission.MEMBERS_READ,
        Permission.CRM_READ,
        Permission.CRM_WRITE,
        Permission.DEALS_MANAGE,
        Permission.INBOX_READ,
        Permission.INBOX_WRITE,
        Permission.CALENDAR_READ,
        Permission.CALENDAR_WRITE,
        Permission.TASKS_READ,
        Permission.TASKS_WRITE,
        Permission.INVOICES_READ,
        Permission.WORKFLOW_READ,
        Permission.WORKFLOW_CREATE,
        Permission.WORKFLOW_UPDATE,
        Permission.WORKFLOW_EXECUTE,
        Permission.INTEGRATION_READ,
        Permission.AI_READ,
        Permission.AI_EXECUTE,
        Permission.ANALYTICS_READ,
    ],
    billing_manager: [
        Permission.ORGANIZATION_READ,
        Permission.WORKSPACE_READ,
        Permission.BILLING_READ,
        Permission.BILLING_MANAGE,
    ],
};
//# sourceMappingURL=permission.enum.js.map