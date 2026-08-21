import { create } from 'zustand';
import { Organization, Workspace } from '../types';

interface TenantState {
  currentOrganization: Organization | null;
  currentWorkspace: Workspace | null;
  organizations: Organization[];
  userOrganizations: Organization[];
  workspaces: Workspace[];
  isLoadingTenant: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setUserOrganizations: (orgs: Organization[]) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setIsLoadingTenant: (loading: boolean) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentOrganization: null,
  currentWorkspace: null,
  organizations: [],
  userOrganizations: [],
  workspaces: [],
  isLoadingTenant: false,
  setCurrentOrganization: (org) => set({ currentOrganization: org }),
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setOrganizations: (organizations) => set({ organizations, userOrganizations: organizations }),
  setUserOrganizations: (userOrganizations) => set({ userOrganizations, organizations: userOrganizations }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setIsLoadingTenant: (isLoadingTenant) => set({ isLoadingTenant }),
}));
