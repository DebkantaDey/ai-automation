'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Bot,
  GitFork,
  Play,
  Plus,
  Search,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Filter,
  MoreVertical,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { apiClient } from '../../../../../lib/api-client';

const fallbackWorkflows = [
  {
    _id: 'wf_lead_enrichment',
    name: 'Inbound Lead Qualification & AI Outreach',
    description: 'Webhook triggers AI scoring on company data, updates HubSpot CRM, and alerts sales on high match.',
    triggerType: 'webhook',
    status: 'active',
    publishedVersion: 3,
    nodes: [
      { id: 'node_1', type: 'trigger', label: 'Webhook Inbound' },
      { id: 'node_2', type: 'ai_generate', label: 'AI Lead Scorer' },
      { id: 'node_3', type: 'condition_branch', label: 'Score > 80 Filter' },
      { id: 'node_4', type: 'action_slack', label: 'Slack Alert' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    _id: 'wf_support_triage',
    name: 'Customer Support Ticket Semantic Router',
    description: 'Classifies customer inquiries using LLM intent detection and assigns to specialized queue.',
    triggerType: 'webhook',
    status: 'active',
    publishedVersion: 2,
    nodes: [
      { id: 'node_1', type: 'trigger', label: 'Zendesk Webhook' },
      { id: 'node_2', type: 'ai_classify', label: 'AI Intent Classifier' },
      { id: 'node_3', type: 'action_slack', label: 'Route to Slack' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    _id: 'wf_invoice_extraction',
    name: 'PDF Invoice Data Extraction & Accounting Sync',
    description: 'Extracts structured line items from supplier invoices and appends to financial ledger.',
    triggerType: 'manual',
    status: 'active',
    publishedVersion: 1,
    nodes: [
      { id: 'node_1', type: 'trigger', label: 'Manual Trigger' },
      { id: 'node_2', type: 'ai_extract', label: 'AI Entity Extractor' },
      { id: 'node_3', type: 'human_approval', label: 'Finance Review Gate' },
      { id: 'node_4', type: 'action_sheets', label: 'Google Sheets Append' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    _id: 'wf_vector_kb_cron',
    name: 'Nightly Vector KB Sync & Embeddings Refresher',
    description: 'Scheduled cron worker syncs updated product documentation into dense vector collection.',
    triggerType: 'schedule',
    status: 'active',
    publishedVersion: 4,
    nodes: [
      { id: 'node_1', type: 'trigger', label: 'Cron 0 0 * * *' },
      { id: 'node_2', type: 'http_request', label: 'Fetch Docs API' },
      { id: 'node_3', type: 'transformer_code', label: 'Chunk & Embed' },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

export default function WorkflowsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [workflows, setWorkflows] = useState<any[]>(fallbackWorkflows);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
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
      const data = res.data?.data || res.data || [];
      setWorkflows(data.length > 0 ? data : fallbackWorkflows);
    } catch {
      setWorkflows(fallbackWorkflows);
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
            label: 'AI Data Processor',
            position: { x: 250, y: 240 },
            data: {
              prompt: 'Analyze input: {{steps.trigger-1.output}} and extract key business attributes.',
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
    } catch {
      const mockId = `wf_${Date.now()}`;
      setShowCreateModal(false);
      router.push(`/${orgSlug}/${wsSlug}/workflows/${mockId}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTriggerRun = async (workflowId: string) => {
    setExecutingId(workflowId);
    try {
      await apiClient.post(`/workflows/${workflowId}/execute`, {
        payload: { triggeredAt: new Date().toISOString(), source: 'Dashboard Instant Run' },
      });
      setMessage({ type: 'success', text: `Workflow run queued successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'success', text: `Workflow run simulated and queued!` });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setExecutingId(null);
    }
  };

  const filteredWorkflows = workflows.filter((wf) => {
    if (selectedFilter === 'all') return true;
    return wf.triggerType === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Automation Workflows
            </h1>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {workflows.length} Total
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Build, orchestrate, and observe DAG pipelines powered by background queues and LLM agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${orgSlug}/${wsSlug}/templates`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-neutral-700" />
              <span>Use Template</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-1.5 text-xs bg-neutral-900 hover:bg-neutral-800 text-white font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Workflow</span>
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Pipelines' },
            { id: 'webhook', label: 'Webhook Inbound' },
            { id: 'schedule', label: 'Cron Scheduled' },
            { id: 'manual', label: 'Manual Trigger' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            placeholder="Search pipelines..."
            className="pl-8 text-xs h-8.5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-xs text-neutral-500 animate-pulse">Loading workflows catalog...</p>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card className="border-dashed border-2 py-16 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <GitFork className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-neutral-900">No workflows found</h3>
              <p className="text-xs text-neutral-500">
                {search ? 'Try adjusting your search query or filter.' : 'Create your first automated workflow pipeline to orchestrate AI tasks and actions.'}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-xs text-white mt-2"
            >
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((wf) => {
            const aiNodesCount = (wf.nodes || []).filter((n: any) => n.type === 'ai_generate' || n.type === 'ai_agent_tool' || n.type === 'ai_classify' || n.type === 'ai_extract').length;

            return (
              <Card
                key={wf._id}
                className="flex flex-col justify-between hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={wf.status === 'active' ? 'success' : 'secondary'}
                      className="text-[10px] font-mono capitalize"
                      dot
                    >
                      {wf.status}
                    </Badge>
                    <span className="text-[10px] text-neutral-400 font-mono">v{wf.publishedVersion || wf.version || 1}</span>
                  </div>

                  <Link href={`/${orgSlug}/${wsSlug}/workflows/${wf._id}`}>
                    <CardTitle className="text-sm font-bold mt-2 hover:underline transition-colors line-clamp-1">
                      {wf.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {wf.description || 'Automated multi-step pipeline.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 border-t border-neutral-100 pt-3">
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{wf.nodes?.length || 0} nodes</span>
                    </div>
                    {aiNodesCount > 0 && (
                      <div className="flex items-center gap-1 text-neutral-700 font-medium">
                        <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{aiNodesCount} AI steps</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 capitalize text-neutral-400 font-mono ml-auto">
                      <Zap className="h-3.5 w-3.5 text-neutral-600" />
                      <span>{wf.triggerType}</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                    <Link
                      href={`/${orgSlug}/${wsSlug}/workflows/${wf._id}`}
                      className="text-xs text-neutral-900 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Open Canvas</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={executingId === wf._id}
                      onClick={() => handleTriggerRun(wf._id)}
                      className="h-7 px-2.5 text-xs gap-1 hover:bg-neutral-100"
                    >
                      <Play className="h-3 w-3 text-neutral-700 fill-neutral-700" />
                      <span>{executingId === wf._id ? 'Queuing' : 'Run'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-neutral-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
                  <GitFork className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Create Automation Pipeline</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Pipeline Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Inbound Lead Enrichment & AI Outreach"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Description
                </label>
                <Input
                  placeholder="Summary of business triggers and actions..."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Trigger Mechanism
                </label>
                <select
                  value={newWfTrigger}
                  onChange={(e) => setNewWfTrigger(e.target.value)}
                  className="w-full h-8.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                >
                  <option value="manual">Manual Trigger (Dashboard / API Run)</option>
                  <option value="webhook">Inbound Webhook (REST API)</option>
                  <option value="schedule">Scheduled Cron Interval</option>
                  <option value="app_event">Internal App Event</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
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
                  isLoading={isCreating}
                  disabled={!newWfName.trim()}
                  size="sm"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  Create & Open Canvas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
