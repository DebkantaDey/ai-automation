'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Webhook,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  KeyRound,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { apiClient } from '../../../../../../lib/api-client';

const SUPPORTED_EVENTS = [
  { id: 'workflow.completed', label: 'workflow.completed' },
  { id: 'workflow.failed', label: 'workflow.failed' },
  { id: 'workflow.waiting_approval', label: 'workflow.waiting_approval' },
  { id: 'subscription.created', label: 'subscription.created' },
  { id: 'payment.succeeded', label: 'payment.succeeded' },
  { id: 'invoice.paid', label: 'invoice.paid' },
];

export default function WebhooksSettingsPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['*']);
  const [isCreating, setIsCreating] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [epRes, delRes] = await Promise.all([
        apiClient.get('/webhooks/endpoints'),
        apiClient.get('/webhooks/deliveries'),
      ]);
      setEndpoints(epRes.data?.data || epRes.data || []);
      setDeliveries(delRes.data?.data || delRes.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load webhooks infrastructure data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgSlug]);

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsCreating(true);
    try {
      await apiClient.post('/webhooks/endpoints', {
        url: newUrl,
        description: newDesc,
        eventTypes: selectedEvents,
      });

      setMessage({ type: 'success', text: 'Webhook endpoint registered successfully!' });
      setShowCreateModal(false);
      setNewUrl('');
      setNewDesc('');
      setSelectedEvents(['*']);
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to register endpoint' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestPing = async (epId: string) => {
    setTestingId(epId);
    try {
      await apiClient.post(`/webhooks/endpoints/${epId}/test`);
      setMessage({ type: 'success', text: 'Test ping event dispatched via BullMQ worker!' });
      setTimeout(() => {
        loadData();
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Ping failed' });
    } finally {
      setTestingId(null);
    }
  };

  const handleRotateSecret = async (epId: string) => {
    if (!confirm('Rotate HMAC secret? Existing secret will be immediately invalidated.')) return;

    try {
      await apiClient.post(`/webhooks/endpoints/${epId}/rotate-secret`);
      setMessage({ type: 'success', text: 'Signing secret rotated successfully' });
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Secret rotation failed' });
    }
  };

  const handleDeleteEndpoint = async (epId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;

    try {
      await apiClient.delete(`/webhooks/endpoints/${epId}`);
      setMessage({ type: 'success', text: 'Endpoint deleted' });
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
    }
  };

  const toggleEventSelection = (eventId: string) => {
    if (eventId === '*') {
      setSelectedEvents(['*']);
      return;
    }

    const withoutWildcard = selectedEvents.filter((e) => e !== '*');
    if (withoutWildcard.includes(eventId)) {
      const next = withoutWildcard.filter((e) => e !== eventId);
      setSelectedEvents(next.length === 0 ? ['*'] : next);
    } else {
      setSelectedEvents([...withoutWildcard, eventId]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Outbound Webhooks
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Deliver signed real-time business events to your external web servers with HMAC-SHA256 verification and automatic retry queuing.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Endpoint</span>
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Endpoints List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Configured Webhook Endpoints ({endpoints.length})
        </h2>

        {endpoints.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-xs text-neutral-500">
            No outbound webhook endpoints registered. Add an endpoint to receive notifications.
          </Card>
        ) : (
          <div className="space-y-3">
            {endpoints.map((ep) => (
              <Card key={ep._id} className="p-4 border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-bold font-mono text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        {ep.url}
                      </code>
                      <Badge variant="success" className="text-[9px] uppercase font-mono">
                        {ep.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {ep.description || 'Subscribed to events:'}{' '}
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {ep.eventTypes?.join(', ') || '*'}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-neutral-400">Signing Secret:</span>
                      <code className="text-[10px] font-mono bg-neutral-50 dark:bg-neutral-950 px-1.5 py-0.5 rounded border">
                        {ep.secret}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ep.secret);
                          setCopiedSecretId(ep._id);
                          setTimeout(() => setCopiedSecretId(null), 2000);
                        }}
                        className="text-neutral-400 hover:text-neutral-600 text-xs"
                      >
                        {copiedSecretId === ep._id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={testingId === ep._id}
                      onClick={() => handleTestPing(ep._id)}
                      className="h-7 px-2.5 text-xs gap-1"
                    >
                      <Send className="h-3 w-3 text-blue-600" />
                      <span>{testingId === ep._id ? 'Sending...' : 'Test Ping'}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRotateSecret(ep._id)}
                      className="h-7 px-2.5 text-xs gap-1"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>Rotate Secret</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEndpoint(ep._id)}
                      className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Audit Logs */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Recent Webhook Delivery Logs
        </h2>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            {deliveries.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">
                No delivery attempts recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium bg-neutral-50/50 dark:bg-neutral-900/50">
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Event Type</th>
                      <th className="py-2.5 px-4">Event ID</th>
                      <th className="py-2.5 px-4">HTTP Status</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4">Attempts</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {deliveries.map((del) => (
                      <tr key={del._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                        <td className="py-2.5 px-4">
                          <Badge
                            variant={
                              del.status === 'delivered'
                                ? 'success'
                                : del.status === 'retrying'
                                ? 'outline'
                                : 'destructive'
                            }
                            className="text-[9px] uppercase font-mono"
                          >
                            {del.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {del.eventType}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-neutral-500 text-[11px]">{del.eventId}</td>
                        <td className="py-2.5 px-4 font-mono">
                          <span
                            className={
                              del.httpStatusCode >= 200 && del.httpStatusCode < 300
                                ? 'text-emerald-600 font-bold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            {del.httpStatusCode || 'ERR'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px]">{del.durationMs}ms</td>
                        <td className="py-2.5 px-4 text-neutral-500">{del.attempts}</td>
                        <td suppressHydrationWarning className="py-2.5 px-4 text-neutral-500 text-[11px]">
                          {new Date(del.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Register Endpoint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Register Webhook Endpoint
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEndpoint} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Endpoint Destination URL
                </label>
                <Input
                  required
                  type="url"
                  placeholder="https://api.yourdomain.com/webhooks"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Description (Optional)
                </label>
                <Input
                  placeholder="e.g. Production events subscriber"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Subscribed Event Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes('*')}
                      onChange={() => toggleEventSelection('*')}
                      className="rounded text-blue-600"
                    />
                    <span className="font-mono font-bold">All Events (*)</span>
                  </label>
                  {SUPPORTED_EVENTS.map((evt) => (
                    <label
                      key={evt.id}
                      className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(evt.id)}
                        onChange={() => toggleEventSelection(evt.id)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-mono text-[11px]">{evt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newUrl.trim()}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreating ? 'Registering...' : 'Register Endpoint'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
