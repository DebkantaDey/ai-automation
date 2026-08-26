export enum Permission {
  // Organization Management
  ORGANIZATION_READ = 'organization.read',
  ORGANIZATION_UPDATE = 'organization.update',
  ORGANIZATION_DELETE = 'organization.delete',

  // Workspace Management
  WORKSPACE_READ = 'workspace.read',
  WORKSPACE_CREATE = 'workspace.create',
  WORKSPACE_UPDATE = 'workspace.update',
  WORKSPACE_DELETE = 'workspace.delete',
  WORKSPACE_ARCHIVE = 'workspace.archive',

  // Team & Member Management
  MEMBERS_READ = 'members.read',
  MEMBERS_INVITE = 'members.invite',
  MEMBERS_UPDATE = 'members.update',
  MEMBERS_REMOVE = 'members.remove',

  // Role Management
  ROLES_READ = 'roles.read',
  ROLES_CREATE = 'roles.create',
  ROLES_UPDATE = 'roles.update',
  ROLES_DELETE = 'roles.delete',

  // Workflows & Automations
  WORKFLOW_READ = 'workflow.read',
  WORKFLOW_CREATE = 'workflow.create',
  WORKFLOW_UPDATE = 'workflow.update',
  WORKFLOW_DELETE = 'workflow.delete',
  WORKFLOW_EXECUTE = 'workflow.execute',

  // Integrations & Webhooks
  INTEGRATION_READ = 'integration.read',
  INTEGRATION_CONNECT = 'integration.connect',
  INTEGRATION_UPDATE = 'integration.update',
  INTEGRATION_DELETE = 'integration.delete',

  // AI Agents & Models
  AI_READ = 'ai.read',
  AI_EXECUTE = 'ai.execute',
  AI_MANAGE = 'ai.manage',

  // Analytics & Metrics
  ANALYTICS_READ = 'analytics.read',

  // Billing & Subscriptions
  BILLING_READ = 'billing.read',
  BILLING_MANAGE = 'billing.manage',

  // API Keys & Developer Access
  API_READ = 'api.read',
  API_MANAGE = 'api.manage',

  // Audit Logs
  AUDIT_READ = 'audit.read',

  // CRM, Leads & Customers
  CRM_READ = 'crm.read',
  CRM_WRITE = 'crm.write',
  CRM_DELETE = 'crm.delete',
  DEALS_MANAGE = 'deals.manage',

  // Omnichannel Inbox
  INBOX_READ = 'inbox.read',
  INBOX_WRITE = 'inbox.write',

  // Calendar & Appointments
  CALENDAR_READ = 'calendar.read',
  CALENDAR_WRITE = 'calendar.write',

  // Tasks & Operations
  TASKS_READ = 'tasks.read',
  TASKS_WRITE = 'tasks.write',

  // Invoices & Billing Ledger
  INVOICES_READ = 'invoices.read',
  INVOICES_WRITE = 'invoices.write',
}

export const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

export interface PermissionDefinition {
  key: Permission;
  category: 'organization' | 'workspace' | 'members' | 'roles' | 'workflow' | 'integration' | 'ai' | 'analytics' | 'billing' | 'api' | 'audit';
  label: string;
  description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
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

export const SystemRolePermissions: Record<string, string[]> = {
  owner: ['*'],
  admin: ALL_PERMISSIONS.filter((p) => p !== Permission.ORGANIZATION_DELETE),
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
