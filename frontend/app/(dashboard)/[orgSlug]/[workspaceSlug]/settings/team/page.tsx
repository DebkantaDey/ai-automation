'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Clock,
  Key,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { Badge } from '../../../../../../components/ui/badge';
import { apiClient } from '../../../../../../lib/api-client';

export default function TeamManagementPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;

  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'roles'>('members');
  const [orgId, setOrgId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const orgRes = await apiClient.get(`/organizations/by-slug/${orgSlug}`);
        const org = orgRes.data?.data || orgRes.data;
        const currentOrgId = org?._id || org?.id;
        setOrgId(currentOrgId);

        if (currentOrgId) {
          const [membersRes, invitesRes, rolesRes] = await Promise.all([
            apiClient.get(`/organizations/${currentOrgId}/members`),
            apiClient.get(`/organizations/${currentOrgId}/invitations`).catch(() => ({ data: [] })),
            apiClient.get(`/organizations/${currentOrgId}/roles`).catch(() => ({ data: [] })),
          ]);

          setMembers(membersRes.data?.data || membersRes.data || []);
          setInvitations(invitesRes.data?.data || invitesRes.data || []);
          setRoles(rolesRes.data?.data || rolesRes.data || []);
        }
      } catch (err: any) {
        setError('Failed to load team and role data');
      } finally {
        setLoading(false);
      }
    }

    if (orgSlug) {
      loadData();
    }
  }, [orgSlug]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);
    setError('');

    try {
      await apiClient.post(`/organizations/${orgId}/invitations`, {
        email: inviteEmail,
        role: inviteRole,
      });

      setSuccess(`Invitation successfully sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');

      // Refresh invites
      const res = await apiClient.get(`/organizations/${orgId}/invitations`);
      setInvitations(res.data?.data || res.data || []);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to send invitation. Ensure you have administrator permissions.',
      );
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setError('');
    try {
      await apiClient.patch(`/organizations/${orgId}/members/${memberId}`, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
      setSuccess('Member role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to update member role. Check your permissions or owner protection rules.',
      );
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this organization?`)) {
      return;
    }

    setError('');
    try {
      await apiClient.delete(`/organizations/${orgId}/members/${memberId}`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setSuccess(`Removed ${memberName} from organization`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to remove member. Organization owners cannot be removed.',
      );
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await apiClient.delete(`/organizations/${orgId}/invitations/${inviteId}`);
      setInvitations((prev) => prev.filter((i) => i.id !== inviteId));
      setSuccess('Invitation revoked successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke invitation');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs text-neutral-500 animate-pulse">Loading team & access control...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Team & Access Control</h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage organization members, send invitations, and configure role-based permissions (RBAC).
          </p>
        </div>

        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </Button>
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

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Active Members ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'invitations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Pending Invitations ({invitations.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Roles & Permissions ({roles.length})
        </button>
      </div>

      {/* Tab 1: Active Members */}
      {activeTab === 'members' && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                      {member.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {member.fullName || `${member.firstName || ''} ${member.lastName || ''}`}
                        </p>
                        {member.isOwner && (
                          <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300 dark:border-amber-800 font-mono">
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={member.role}
                      disabled={member.isOwner}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="h-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 text-xs capitalize disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="operator">Operator</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={member.isOwner}
                      onClick={() => handleRemoveMember(member.id, member.fullName || member.email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 h-8 w-8 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={member.isOwner ? 'Cannot remove organization owner' : 'Remove member'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Pending Invitations */}
      {activeTab === 'invitations' && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            {invitations.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No pending invitations. Click &quot;Invite Member&quot; to add team members.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">{inv.email}</p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                          <span>Invited by {inv.invitedBy}</span>
                          <span>•</span>
                          <span suppressHydrationWarning className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {new Date(inv.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {inv.role}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 h-7 px-2.5"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Roles & Permissions Directory */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <Card key={role.id || role.slug} className="border-neutral-200 dark:border-neutral-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>{role.name}</span>
                  </CardTitle>
                  <Badge variant={role.isSystemRole ? 'outline' : 'success'} className="text-[10px] font-mono">
                    {role.isSystemRole ? 'System' : 'Custom'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Permissions ({role.permissions?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.map((p: string) => (
                      <Badge key={p} variant="secondary" className="text-[9px] font-mono px-1.5 py-0.5">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-2xl border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-900">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span>Invite Team Member</span>
              </CardTitle>
              <button onClick={() => setShowInviteModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <form onSubmit={handleSendInvite}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Work Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Role & Permissions *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-xs capitalize shadow-sm"
                  >
                    <option value="admin">Admin — Team, workflow & integration configuration</option>
                    <option value="manager">Manager — Build, configure & delete workflows/AI</option>
                    <option value="operator">Operator — Trigger, execute & monitor workflows</option>
                    <option value="member">Member — Standard workflow creation & execution</option>
                    <option value="viewer">Viewer — Read-only dashboard & execution logs</option>
                  </select>
                </div>
              </CardContent>

              <div className="flex justify-end gap-2 p-4 border-t border-neutral-100 dark:border-neutral-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendingInvite}
                  className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sendingInvite ? 'Sending...' : 'Send Invitation'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
