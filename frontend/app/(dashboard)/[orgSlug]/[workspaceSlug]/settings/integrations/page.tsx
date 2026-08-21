'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Mail,
  Table,
  MessageSquare,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { apiClient } from '../../../../../../lib/api-client';

const ICONS_MAP: Record<string, any> = {
  slack: MessageSquare,
  google_sheets: Table,
  gmail: Mail,
  hubspot: Building,
  discord: Globe,
};

export default function IntegrationsSettingsPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [catalog, setCatalog] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<any | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [connNameInput, setConnNameInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, connRes] = await Promise.all([
        apiClient.get('/integrations/catalog'),
        apiClient.get('/integrations'),
      ]);
      setCatalog(catRes.data?.data || catRes.data || []);
      setConnections(connRes.data?.data || connRes.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load integrations catalog' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgSlug]);

  const handleConnectApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;

    setIsConnecting(true);
    try {
      await apiClient.post('/integrations/connect/api-key', {
        provider: selectedConnector.id,
        name: connNameInput || selectedConnector.name,
        apiKey: apiKeyInput || undefined,
        webhookUrl: webhookUrlInput || undefined,
      });

      setMessage({ type: 'success', text: `Connected ${selectedConnector.name} successfully!` });
      setSelectedConnector(null);
      setApiKeyInput('');
      setWebhookUrlInput('');
      setConnNameInput('');
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Connection validation failed' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async (connId: string) => {
    setTestingId(connId);
    try {
      const res = await apiClient.post(`/integrations/${connId}/test`);
      if (res.data?.valid) {
        setMessage({ type: 'success', text: 'Connection verified and active!' });
      } else {
        setMessage({ type: 'error', text: 'Connection test failed. Please verify credentials.' });
      }
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Test request failed' });
    } finally {
      setTestingId(null);
    }
  };

  const handleDisconnect = async (connId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      await apiClient.delete(`/integrations/${connId}`);
      setMessage({ type: 'success', text: 'Integration disconnected' });
      await loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to disconnect' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            App Integrations
          </h1>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Connect external business applications and communication channels with AES-256 encrypted credentials.
        </p>
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

      {/* Active Connections */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
          Active Workspace Connections ({connections.length})
        </h2>

        {connections.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-xs text-neutral-500">
            No active connections. Connect an application below to enable workflow actions.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((conn) => {
              const Icon = ICONS_MAP[conn.provider] || Plug;

              return (
                <Card key={conn._id} className="p-4 flex items-center justify-between border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">{conn.name}</span>
                        <Badge
                          variant={conn.status === 'connected' ? 'success' : 'destructive'}
                          className="text-[9px] uppercase font-mono"
                        >
                          {conn.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {conn.metadata?.accountEmail || conn.metadata?.accountName || conn.provider}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={testingId === conn._id}
                      onClick={() => handleTestConnection(conn._id)}
                      className="h-7 px-2 text-xs gap-1"
                    >
                      <RefreshCw className={`h-3 w-3 ${testingId === conn._id ? 'animate-spin' : ''}`} />
                      <span>Test</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(conn._id)}
                      className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Catalog */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
          Available Connectors Marketplace
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {catalog.map((connector) => {
            const Icon = ICONS_MAP[connector.id] || Plug;

            return (
              <Card key={connector.id} className="flex flex-col justify-between p-4 hover:border-blue-500/50 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {connector.category}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{connector.name}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">{connector.description}</p>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedConnector(connector);
                      setConnNameInput(connector.name);
                    }}
                    className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>Connect</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Connect Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Connect {selectedConnector.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="text-neutral-400 hover:text-neutral-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectApiKey} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Connection Name
                </label>
                <Input
                  required
                  placeholder={selectedConnector.name}
                  value={connNameInput}
                  onChange={(e) => setConnNameInput(e.target.value)}
                  className="text-xs"
                />
              </div>

              {selectedConnector.id === 'discord' || selectedConnector.authType === 'webhook_url' ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Webhook URL
                  </label>
                  <Input
                    required
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    API Token / Secret Key / Webhook URL
                  </label>
                  <Input
                    required
                    type="password"
                    placeholder="Enter secret token (stored with AES-256 encryption)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConnector(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConnecting}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isConnecting ? 'Verifying & Encrypting...' : 'Save Connection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
