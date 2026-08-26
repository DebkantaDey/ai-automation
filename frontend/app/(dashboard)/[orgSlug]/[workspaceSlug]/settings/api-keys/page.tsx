'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  Code2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { apiClient } from '../../../../../../lib/api-client';

const SCOPES_OPTIONS = [
  { id: 'workflows:read', label: 'Workflows Read', desc: 'Read workflows and configurations' },
  { id: 'workflows:execute', label: 'Workflows Execute', desc: 'Trigger workflow executions' },
  { id: 'agents:run', label: 'AI Agents Run', desc: 'Run autonomous agent reasoning loops' },
  { id: 'kb:query', label: 'Knowledge Base Query', desc: 'Ask vector search RAG questions' },
  { id: '*', label: 'Full Access (All Scopes)', desc: 'Unrestricted workspace API access' },
];

export default function ApiKeysSettingsPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;

  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<{ name: string; secretKey: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['*']);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api-keys');
      setKeys(res.data?.data || res.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load API keys' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [orgSlug]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/api-keys', {
        name,
        scopes: selectedScopes,
        expiresInDays: Number(expiresInDays) || 0,
      });

      const data = res.data?.data || res.data;
      setNewKeyResult({
        name: data.apiKey?.name || name,
        secretKey: data.secretKey,
      });
      setShowCreateModal(false);
      setName('');
      await loadKeys();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create API key' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key immediately? Any applications using it will lose access.')) {
      return;
    }

    try {
      await apiClient.delete(`/api-keys/${id}`);
      setMessage({ type: 'success', text: 'API Key revoked successfully' });
      await loadKeys();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to revoke key' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleScope = (scopeId: string) => {
    if (scopeId === '*') {
      setSelectedScopes(['*']);
      return;
    }
    const filtered = selectedScopes.filter((s) => s !== '*');
    if (filtered.includes(scopeId)) {
      const next = filtered.filter((s) => s !== scopeId);
      setSelectedScopes(next.length === 0 ? ['*'] : next);
    } else {
      setSelectedScopes([...filtered, scopeId]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-neutral-800" />
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              API Keys & Developer Access
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Authenticate programmatic REST requests to trigger workflows, run AI agents, and query knowledge bases.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="gap-1.5 text-xs bg-neutral-900 hover:bg-neutral-800 text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create New Key</span>
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Secret Key Display Modal */}
      {newKeyResult && (
        <Card className="border-neutral-200 bg-neutral-50 p-5 space-y-3 shadow-none">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs">
            <ShieldAlert className="h-4 w-4 text-neutral-700" />
            <span>Copy your Secret API Key</span>
          </div>
          <p className="text-xs text-neutral-600">
            Please copy this secret key now. For security purposes, it will <strong>never be shown again</strong>.
          </p>

          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={newKeyResult.secretKey}
              className="font-mono text-xs bg-white border-neutral-200"
            />
            <Button
              size="sm"
              onClick={() => copyToClipboard(newKeyResult.secretKey)}
              className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white shrink-0 gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Key'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNewKeyResult(null)}
              className="text-xs border-neutral-200"
            >
              Done
            </Button>
          </div>
        </Card>
      )}

      {/* API Keys Table */}
      <Card className="border-neutral-200">
        <CardHeader className="py-3 px-4 border-b border-neutral-100">
          <CardTitle className="text-xs font-bold text-neutral-900">
            Active Workspace API Keys ({keys.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {keys.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-8">No API keys created yet. Generate one above to access the Public API.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-medium bg-neutral-50">
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Key Prefix</th>
                    <th className="py-2.5 px-4">Scopes</th>
                    <th className="py-2.5 px-4">Usage</th>
                    <th className="py-2.5 px-4">Expires</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {keys.map((k) => (
                    <tr key={k._id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">{k.name}</td>
                      <td className="py-2.5 px-4 font-mono text-neutral-500">{k.keyPrefix}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes?.map((s: string) => (
                            <span key={s} className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-neutral-500">{k.usageCount || 0} reqs</td>
                      <td suppressHydrationWarning className="py-2.5 px-4 text-neutral-400 text-[11px]">
                        {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant={k.status === 'active' ? 'success' : 'destructive'} className="text-[9px] uppercase font-mono">
                          {k.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {k.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevoke(k._id)}
                            className="h-7 px-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Revoke</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-neutral-800" />
                <h2 className="text-base font-bold text-neutral-900">Generate API Key</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Key Name / Description</label>
                <Input required placeholder="e.g. Production CI/CD Runner" value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Expiration</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full h-9 rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-900"
                >
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>1 Year</option>
                  <option value={0}>No Expiration (Never)</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-neutral-700">Allowed Scopes</label>
                <div className="space-y-1.5">
                  {SCOPES_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer p-2 rounded border border-neutral-200 hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(opt.id)}
                        onChange={() => toggleScope(opt.id)}
                        className="rounded text-neutral-900 focus:ring-neutral-900"
                      />
                      <div>
                        <p className="font-semibold text-xs text-neutral-900">{opt.label}</p>
                        <p className="text-[10px] text-neutral-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs border-neutral-200">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white">
                  {isSubmitting ? 'Generating...' : 'Generate Key'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
