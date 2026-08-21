import React from 'react';
import { TenantProvider } from '../../../../components/providers/TenantProvider';
import { AppShell } from '../../../../components/layout/AppShell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    orgSlug: string;
    workspaceSlug: string;
  }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const resolvedParams = await params;

  return (
    <TenantProvider
      initialOrgSlug={resolvedParams.orgSlug}
      initialWorkspaceSlug={resolvedParams.workspaceSlug}
    >
      <AppShell>{children}</AppShell>
    </TenantProvider>
  );
}
