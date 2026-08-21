'use client';

import React, { useEffect } from 'react';
import { useTenantStore } from '../../stores/tenant-store';
import { useAuthStore } from '../../stores/auth-store';
import { apiClient } from '../../lib/api-client';

interface TenantProviderProps {
  children: React.ReactNode;
  initialOrgSlug?: string;
  initialWorkspaceSlug?: string;
}

export function TenantProvider({
  children,
  initialOrgSlug,
  initialWorkspaceSlug,
}: TenantProviderProps) {
  const {
    currentOrganization,
    currentWorkspace,
    setCurrentOrganization,
    setCurrentWorkspace,
    setOrganizations,
    setWorkspaces,
    setIsLoadingTenant,
  } = useTenantStore();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Hydrate user session from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_access_token');
      const refreshToken = localStorage.getItem('auth_refresh_token');

      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          setAuth(user, {
            accessToken: token,
            refreshToken: refreshToken || '',
            tokenType: 'Bearer',
            expiresIn: '15m',
          });
        } catch (e) {
          console.error('Failed to parse cached user session', e);
        }
      }
    }

    // Fetch tenant profile & hydrate organizations/workspaces
    async function loadTenantData() {
      setIsLoadingTenant(true);
      try {
        const token = localStorage.getItem('auth_access_token');
        if (!token) {
          // Setup fallback demo tenant data if unauthenticated for visual preview
          const demoOrg = {
            id: 'org-demo-1',
            name: 'Acme Automation Corp',
            slug: initialOrgSlug || 'acme-corp',
            plan: 'pro',
            role: 'owner',
          };
          const demoWs = {
            id: 'ws-demo-1',
            name: 'Production Workspace',
            slug: initialWorkspaceSlug || 'default',
            isDefault: true,
          };
          setCurrentOrganization(demoOrg);
          setCurrentWorkspace(demoWs);
          setOrganizations([demoOrg]);
          setWorkspaces([demoWs]);
          setIsLoadingTenant(false);
          return;
        }

        const res = await apiClient.get('/auth/me');
        const data = res.data?.data || res.data;

        if (data) {
          if (data.organizations) {
            setOrganizations(data.organizations);
            const activeOrg =
              data.organizations.find((o: any) => o.slug === initialOrgSlug) ||
              data.organizations[0];
            if (activeOrg) {
              setCurrentOrganization(activeOrg);
              localStorage.setItem('active_org_id', activeOrg.id);
            }
          }

          if (data.workspaces) {
            setWorkspaces(data.workspaces);
            const activeWs =
              data.workspaces.find((w: any) => w.slug === initialWorkspaceSlug) ||
              data.workspaces[0];
            if (activeWs) {
              setCurrentWorkspace(activeWs);
              localStorage.setItem('active_workspace_id', activeWs.id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load tenant data from backend API:', err);
      } finally {
        setIsLoadingTenant(false);
      }
    }

    loadTenantData();
  }, [initialOrgSlug, initialWorkspaceSlug, setAuth, setCurrentOrganization, setCurrentWorkspace, setIsLoadingTenant, setOrganizations, setWorkspaces]);

  return <>{children}</>;
}
