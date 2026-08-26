'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, ChevronsUpDown, Layers, Plus, X } from 'lucide-react';
import { useTenantStore } from '../../stores/tenant-store';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Workspace } from '../../types';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

export function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams();
  const { currentOrganization, currentWorkspace, workspaces, setWorkspaces, setCurrentWorkspace } =
    useTenantStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDescription, setNewWsDescription] = useState('');
  const [newWsColor, setNewWsColor] = useState('#3B82F6');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadWorkspaces() {
      if (!currentOrganization?.id && !params?.orgSlug) return;

      try {
        const orgId = currentOrganization?.id;
        const res = await apiClient.get('/workspaces', {
          headers: orgId ? { 'x-organization-id': orgId } : {},
        });
        const list: Workspace[] = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setWorkspaces(list);
          const activeSlug = params?.workspaceSlug as string;
          const matched = list.find((w: Workspace) => w.slug === activeSlug) || list[0];
          setCurrentWorkspace(matched);
        } else if (workspaces.length === 0) {
          const defaultWs: Workspace[] = [
            { id: 'ws_default', name: 'Production Automations', slug: 'default', color: '#3B82F6', isDefault: true },
            { id: 'ws_staging', name: 'Staging Environment', slug: 'staging', color: '#10B981', isDefault: false },
          ];
          setWorkspaces(defaultWs);
          if (!currentWorkspace) setCurrentWorkspace(defaultWs[0]);
        }
      } catch {
        if (workspaces.length === 0) {
          const defaultWs: Workspace[] = [
            { id: 'ws_default', name: 'Production Automations', slug: 'default', color: '#3B82F6', isDefault: true },
            { id: 'ws_staging', name: 'Staging Environment', slug: 'staging', color: '#10B981', isDefault: false },
          ];
          setWorkspaces(defaultWs);
          if (!currentWorkspace) setCurrentWorkspace(defaultWs[0]);
        }
      }
    }

    loadWorkspaces();
  }, [currentOrganization?.id, params?.orgSlug, params?.workspaceSlug, setCurrentWorkspace, setWorkspaces]);

  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    setIsOpen(false);
    const orgSlug = currentOrganization?.slug || (params?.orgSlug as string) || 'default-org';
    router.push(`/${orgSlug}/${ws.slug}`);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setCreating(true);
    setError('');

    try {
      const orgId = currentOrganization?.id;
      const res = await apiClient.post(
        '/workspaces',
        {
          name: newWsName,
          description: newWsDescription,
          color: newWsColor,
        },
        {
          headers: orgId ? { 'x-organization-id': orgId } : {},
        },
      );

      const createdWs: Workspace = res.data?.data || res.data;
      setWorkspaces([...workspaces, createdWs]);
      setCurrentWorkspace(createdWs);
      setShowCreateModal(false);
      setNewWsName('');
      setNewWsDescription('');

      const orgSlug = currentOrganization?.slug || (params?.orgSlug as string);
      router.push(`/${orgSlug}/${createdWs.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-left text-xs font-medium hover:border-neutral-300 shadow-none transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className="h-2 w-2 rounded-full shrink-0 bg-neutral-800"
            />
            <span className="truncate text-neutral-800 font-semibold">
              {currentWorkspace?.name || 'Default Workspace'}
            </span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-48 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                Workspaces ({workspaces.length})
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {workspaces.map((ws) => {
                  const isSelected =
                    ws.id === currentWorkspace?.id || ws.slug === currentWorkspace?.slug;
                  return (
                    <button
                      key={ws.id || ws.slug}
                      onClick={() => handleSelectWorkspace(ws)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-100 text-neutral-900 font-semibold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0 bg-neutral-700"
                        />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-neutral-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="my-1 border-t border-neutral-100" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-neutral-900 hover:bg-neutral-100 font-semibold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Workspace</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-2xl border-neutral-200 animate-in fade-in-0 zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-neutral-800" />
                <span>Create Workspace</span>
              </CardTitle>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <form onSubmit={handleCreateWorkspace}>
              <CardContent className="space-y-3.5 pt-4">
                {error && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Workspace Name *
                  </label>
                  <Input
                    type="text"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    placeholder="e.g. Production Automations"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Description (optional)
                  </label>
                  <Input
                    type="text"
                    value={newWsDescription}
                    onChange={(e) => setNewWsDescription(e.target.value)}
                    placeholder="Environment purpose & scope"
                    className="text-xs"
                  />
                </div>
              </CardContent>

              <div className="flex justify-end gap-2 p-3.5 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
