export declare enum Permission {
    ORGANIZATION_READ = "organization.read",
    ORGANIZATION_UPDATE = "organization.update",
    ORGANIZATION_DELETE = "organization.delete",
    WORKSPACE_READ = "workspace.read",
    WORKSPACE_CREATE = "workspace.create",
    WORKSPACE_UPDATE = "workspace.update",
    WORKSPACE_DELETE = "workspace.delete",
    WORKSPACE_ARCHIVE = "workspace.archive",
    MEMBERS_READ = "members.read",
    MEMBERS_INVITE = "members.invite",
    MEMBERS_UPDATE = "members.update",
    MEMBERS_REMOVE = "members.remove",
    ROLES_READ = "roles.read",
    ROLES_CREATE = "roles.create",
    ROLES_UPDATE = "roles.update",
    ROLES_DELETE = "roles.delete",
    WORKFLOW_READ = "workflow.read",
    WORKFLOW_CREATE = "workflow.create",
    WORKFLOW_UPDATE = "workflow.update",
    WORKFLOW_DELETE = "workflow.delete",
    WORKFLOW_EXECUTE = "workflow.execute",
    INTEGRATION_READ = "integration.read",
    INTEGRATION_CONNECT = "integration.connect",
    INTEGRATION_UPDATE = "integration.update",
    INTEGRATION_DELETE = "integration.delete",
    AI_READ = "ai.read",
    AI_EXECUTE = "ai.execute",
    AI_MANAGE = "ai.manage",
    ANALYTICS_READ = "analytics.read",
    BILLING_READ = "billing.read",
    BILLING_MANAGE = "billing.manage",
    API_READ = "api.read",
    API_MANAGE = "api.manage",
    AUDIT_READ = "audit.read",
    CRM_READ = "crm.read",
    CRM_WRITE = "crm.write",
    CRM_DELETE = "crm.delete",
    DEALS_MANAGE = "deals.manage",
    INBOX_READ = "inbox.read",
    INBOX_WRITE = "inbox.write",
    CALENDAR_READ = "calendar.read",
    CALENDAR_WRITE = "calendar.write",
    TASKS_READ = "tasks.read",
    TASKS_WRITE = "tasks.write",
    INVOICES_READ = "invoices.read",
    INVOICES_WRITE = "invoices.write"
}
export declare const ALL_PERMISSIONS: Permission[];
export interface PermissionDefinition {
    key: Permission;
    category: 'organization' | 'workspace' | 'members' | 'roles' | 'workflow' | 'integration' | 'ai' | 'analytics' | 'billing' | 'api' | 'audit';
    label: string;
    description: string;
}
export declare const PERMISSION_DEFINITIONS: PermissionDefinition[];
export declare const SystemRolePermissions: Record<string, string[]>;
