'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layers, Shield, Trash2, CheckCircle2, AlertCircle, Save, Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { Badge } from '../../../../../../components/ui/badge';
import { apiClient } from '../../../../../../lib/api-client';
import { useTenantStore } from '../../../../../../stores/tenant-store';

const PRESET_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = params?.workspaceSlug as string;
  const { currentOrganization } = useTenantStore();

  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [timezone, setTimezone] = useState('UTC');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    async function loadWorkspace() {
      if (!wsSlug) return;
      setLoading(true);
      try {
        const res = await apiClient.get(`/workspaces/by-slug/${wsSlug}`);
        const data = res.data?.data || res.data;
        if (data) {
          setWorkspace(data);
          setName(data.name || '');
          setDescription(data.description || '');
          setColor(data.color || '#3B82F6');
          setTimezone(data.timezone || 'UTC');
          setStatus(data.status || 'active');
        }
      } catch (err: any) {
        setError('Failed to load workspace settings');
      } finally {
        setLoading(false);
      }
    }
    loadWorkspace();
  }, [wsSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await apiClient.patch(`/workspaces/${workspace._id || workspace.id}`, {
        name,
        description,
        color,
        timezone,
        status,
      });

      const updated = res.data?.data || res.data;
      setWorkspace(updated);
      setSuccess('Workspace settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this workspace? Workflows cannot be executed while archived.')) {
      return;
    }

    try {
      await apiClient.post(`/workspaces/${workspace._id || workspace.id}/archive`);
      setStatus('archived');
      setSuccess('Workspace archived successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cannot archive this workspace');
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete '${workspace.name}'? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/workspaces/${workspace._id || workspace.id}`);
      router.push(`/${orgSlug}/default`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cannot delete this workspace');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs text-neutral-500 animate-pulse">Loading workspace settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <Layers className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Workspace Settings</h1>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Configure settings, permissions, and preferences for &quot;{workspace?.name}&quot;.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">General Information</CardTitle>
              {workspace?.isDefault && (
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 font-mono">
                  Default Workspace
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Manage your workspace identity and appearance across your organization.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Workspace Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Workspace Slug
                </label>
                <Input
                  value={workspace?.slug}
                  disabled
                  className="text-xs bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed font-mono text-neutral-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Workflows and integrations for this department"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Workspace Accent Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      color === col ? 'scale-125 ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-xs"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Workspace Changes'}</span>
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10">
        <CardHeader className="pb-3 border-b border-red-100 dark:border-red-950">
          <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-xs">
            Critical actions affecting this workspace and all contained workflows.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">Archive Workspace</p>
              <p className="text-[11px] text-neutral-500">
                Prevent workflow triggers and agent execution in this workspace.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={workspace?.isDefault || status === 'archived'}
              onClick={handleArchive}
              className="text-xs gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>{status === 'archived' ? 'Archived' : 'Archive'}</span>
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-red-100 dark:border-red-950 pt-4">
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">Delete Workspace</p>
              <p className="text-[11px] text-neutral-500">
                {workspace?.isDefault
                  ? 'Default workspaces are permanently protected and cannot be deleted.'
                  : 'Permanently remove this workspace and its associated workflow automations.'}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={workspace?.isDefault}
              onClick={handleDelete}
              className="text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Workspace</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
