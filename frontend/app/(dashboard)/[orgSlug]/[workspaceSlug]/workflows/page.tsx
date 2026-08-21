'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Bot,
  GitFork,
  MoreVertical,
  Play,
  Plus,
  Search,
  Sparkles,
  Zap,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { apiClient } from '../../../../../lib/api-client';

export default function WorkflowsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfTrigger, setNewWfTrigger] = useState('manual');
  const [isCreating, setIsCreating] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/workflows', {
        params: { search: search || undefined },
      });
      setWorkflows(res.data?.data || res.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load automation workflows' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [search]);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    setIsCreating(true);
    try {
      const res = await apiClient.post('/workflows', {
        name: newWfName,
        description: newWfDesc,
        triggerType: newWfTrigger,
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            label: newWfTrigger === 'webhook' ? 'Webhook Inbound' : newWfTrigger === 'schedule' ? 'Schedule Cron' : 'Manual Trigger',
            position: { x: 250, y: 100 },
            data: { triggerType: newWfTrigger },
          },
          {
            id: 'ai-1',
            type: 'ai_generate',
            label: 'AI Processor',
            position: { x: 250, y: 240 },
            data: {
              prompt: 'Analyze input: {{steps.trigger-1.output}} and extract key business insights.',
              provider: 'openai',
            },
          },
        ],
        edges: [{ id: 'e1', source: 'trigger-1', target: 'ai-1' }],
      });

      const created = res.data?.data || res.data;
      setShowCreateModal(false);
      setNewWfName('');
      setNewWfDesc('');
      router.push(`/${orgSlug}/${wsSlug}/workflows/${created._id}`);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create workflow' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleTriggerRun = async (workflowId: string) => {
    setExecutingId(workflowId);
    try {
      const res = await apiClient.post(`/workflows/${workflowId}/execute`, {
        payload: { triggeredAt: new Date().toISOString(), source: 'Dashboard Manual Run' },
      });
      setMessage({ type: 'success', text: `Workflow run queued successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to trigger execution' });
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Automation Workflows
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Build, test, and orchestrate multi-step DAG workflows powered by queue workers and AI models.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Workflow</span>
        </Button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            placeholder="Search workflows by title or trigger..."
            className="pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Link href={`/${orgSlug}/${wsSlug}/executions`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5 text-neutral-500" />
            <span>Execution History</span>
          </Button>
        </Link>
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-xs text-neutral-500 animate-pulse">Loading workflows...</p>
        </div>
      ) : workflows.length === 0 ? (
        <Card className="border-dashed border-2 py-12 text-center">
          <CardContent className="space-y-3">
            <GitFork className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-700" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No workflows yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Create your first automated workflow to connect business triggers, AI models, and action endpoints.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-xs text-white"
            >
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => {
            const aiNodesCount = (wf.nodes || []).filter((n: any) => n.type === 'ai_generate' || n.type === 'ai_agent_tool').length;

            return (
              <Card key={wf._id} className="flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={wf.status === 'active' ? 'success' : 'secondary'}
                      className="text-[10px] font-mono capitalize"
                    >
                      {wf.status}
                    </Badge>
                    <span className="text-[10px] text-neutral-400 font-mono">v{wf.publishedVersion || wf.version || 1}</span>
                  </div>
                  <Link href={`/${orgSlug}/${wsSlug}/workflows/${wf._id}`}>
                    <CardTitle className="text-sm font-bold mt-2 hover:text-blue-600 transition-colors line-clamp-1">
                      {wf.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {wf.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{wf.nodes?.length || 0} nodes</span>
                    </div>
                    {aiNodesCount > 0 && (
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{aiNodesCount} AI steps</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 capitalize text-neutral-400">
                      <Zap className="h-3.5 w-3.5" />
                      <span>{wf.triggerType}</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between">
                    <Link
                      href={`/${orgSlug}/${wsSlug}/workflows/${wf._id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <span>Open Builder</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={executingId === wf._id}
                      onClick={() => handleTriggerRun(wf._id)}
                      className="h-7 px-2.5 text-xs gap-1 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600"
                    >
                      <Play className="h-3 w-3 text-blue-600 fill-blue-600" />
                      <span>{executingId === wf._id ? 'Queuing...' : 'Run'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create Automation Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Workflow Name
                </label>
                <Input
                  required
                  placeholder="e.g. Lead Enrichment & AI Outreach"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <Input
                  placeholder="Brief summary of automation logic..."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Trigger Mechanism
                </label>
                <select
                  value={newWfTrigger}
                  onChange={(e) => setNewWfTrigger(e.target.value)}
                  className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 text-xs text-neutral-900 dark:text-white"
                >
                  <option value="manual">Manual Trigger (Dashboard / API)</option>
                  <option value="webhook">Inbound Webhook (External Apps)</option>
                  <option value="schedule">Scheduled Cron Interval</option>
                  <option value="app_event">Internal Platform Event</option>
                </select>
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
                  disabled={isCreating || !newWfName.trim()}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreating ? 'Creating...' : 'Create & Open Canvas'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
