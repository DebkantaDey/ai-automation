export interface TenantContext {
  userId?: string;
  userEmail?: string;
  organizationId?: string;
  organizationSlug?: string;
  workspaceId?: string;
  workspaceSlug?: string;
  role?: string;
  permissions?: string[];
  correlationId?: string;
}
