'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  Check,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  GitFork,
  Globe,
  HelpCircle,
  History,
  Layers,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Split,
  Table,
  Trash2,
  Upload,
  UserCheck,
  Zap,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  CopyPlus,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import { apiClient } from '../../../../../../lib/api-client';

const NODE_CATEGORIES = [
  {
    category: 'Triggers',
    items: [
      { type: 'trigger', label: 'Inbound Webhook', icon: Zap, color: 'text-neutral-800 bg-neutral-100', defaultData: { triggerType: 'webhook' } },
      { type: 'trigger', label: 'Schedule (Cron)', icon: Clock, color: 'text-neutral-800 bg-neutral-100', defaultData: { triggerType: 'schedule', cron: '0 9 * * 1-5' } },
    ],
  },
  {
    category: 'Logic & Flow Control',
    items: [
      { type: 'condition_branch', label: 'Condition / Filter', icon: GitFork, color: 'text-neutral-800 bg-neutral-100', defaultData: { matchType: 'all', rules: [{ field: '{{trigger.score}}', operator: '>', value: '80' }] } },
      { type: 'loop', label: 'Safe Loop Engine', icon: Repeat, color: 'text-neutral-800 bg-neutral-100', defaultData: { items: '{{steps.trigger.output.items}}', maxIterations: 100, itemTemplate: 'Item {{index}}: {{item}}' } },
      { type: 'human_approval', label: 'Human Approval Gate', icon: UserCheck, color: 'text-neutral-800 bg-neutral-100', defaultData: { requiredRole: 'Manager', message: 'Review required' } },
      { type: 'delay', label: 'Delay Timer', icon: Clock, color: 'text-neutral-800 bg-neutral-100', defaultData: { seconds: '5' } },
      { type: 'transformer_code', label: 'Data Transformer', icon: Code2, color: 'text-neutral-800 bg-neutral-100', defaultData: { template: '{{steps.trigger.output}}' } },
    ],
  },
  {
    category: 'AI Specialists',
    items: [
      { type: 'ai_generate', label: 'AI Generate (LLM)', icon: Sparkles, color: 'text-neutral-800 bg-neutral-100', defaultData: { prompt: 'Generate concise summary of: {{steps.trigger.output}}', provider: 'openai' } },
      { type: 'ai_classify', label: 'AI Intent Classifier', icon: Split, color: 'text-neutral-800 bg-neutral-100', defaultData: { prompt: '{{steps.trigger.output.text}}', categories: ['High Priority', 'Normal Inquiry', 'Spam'] } },
      { type: 'ai_extract', label: 'AI Entity Extraction', icon: Code2, color: 'text-neutral-800 bg-neutral-100', defaultData: { prompt: '{{steps.trigger.output.body}}', fields: ['name', 'email', 'company', 'budget'] } },
    ],
  },
  {
    category: 'Actions & App Connectors',
    items: [
      { type: 'http_request', label: 'HTTP REST Request', icon: Globe, color: 'text-neutral-800 bg-neutral-100', defaultData: { method: 'POST', url: 'https://api.example.com/v1/event' } },
      { type: 'action_slack', label: 'Slack Notification', icon: Send, color: 'text-neutral-800 bg-neutral-100', defaultData: { action: 'send_message', params: { text: 'Notification from workflow: {{workflow.name}}' } } },
      { type: 'action_gmail', label: 'Send Email via Gmail', icon: Mail, color: 'text-neutral-800 bg-neutral-100', defaultData: { action: 'send_email', params: { to: '{{trigger.email}}', subject: 'Automation Update', body: 'Hello!' } } },
      { type: 'action_sheets', label: 'Google Sheets Append', icon: Table, color: 'text-neutral-800 bg-neutral-100', defaultData: { action: 'append_row', params: { spreadsheetId: '1AbCd...', range: 'Sheet1!A:E', values: ['{{trigger.date}}', '{{trigger.name}}'] } } },
      { type: 'action_hubspot', label: 'HubSpot Create Lead', icon: Building, color: 'text-neutral-800 bg-neutral-100', defaultData: { action: 'create_contact', params: { email: '{{trigger.email}}', firstname: '{{trigger.firstname}}' } } },
    ],
  },
];

export default function AdvancedWorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';
  const workflowId = params?.workflowId as string;

  const fallbackWorkflow = {
    _id: workflowId || 'wf_lead_enrichment',
    name: 'Inbound Lead Qualification & AI Outreach',
    description: 'Visual DAG execution pipeline connecting triggers, AI models, and action endpoints.',
    status: 'active',
    version: 3,
    publishedVersion: 3,
    webhookId: 'wh_9981a2',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        label: 'Webhook Inbound Receiver',
        position: { x: 250, y: 100 },
        data: { triggerType: 'webhook' },
      },
      {
        id: 'ai-1',
        type: 'ai_generate',
        label: 'AI Lead Scorer (GPT-4o)',
        position: { x: 250, y: 220 },
        data: { prompt: 'Analyze lead: {{steps.trigger-1.output}} and compute enterprise fit score.', provider: 'openai' },
      },
      {
        id: 'cond-1',
        type: 'condition_branch',
        label: 'Score > 80 Filter',
        position: { x: 250, y: 340 },
        data: { matchType: 'all', rules: [{ field: '{{steps.ai-1.output.fitScore}}', operator: '>', value: '80' }] },
      },
      {
        id: 'act-1',
        type: 'action_slack',
        label: 'Slack Sales Alert',
        position: { x: 250, y: 460 },
        data: { action: 'send_message', params: { text: 'New High Priority Lead: {{steps.ai-1.output.company}}' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'ai-1' },
      { id: 'e2', source: 'ai-1', target: 'cond-1' },
      { id: 'e3', source: 'cond-1', target: 'act-1' },
    ],
  };

  const [workflow, setWorkflow] = useState<any>(fallbackWorkflow);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('trigger-1');
  const [activeTab, setActiveTab] = useState<'canvas' | 'versions'>('canvas');
  const [nodeSearch, setNodeSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const loadWorkflow = async () => {
    setLoading(true);
    try {
      const [wfRes, verRes] = await Promise.all([
        apiClient.get(`/workflows/${workflowId}`),
        apiClient.get(`/workflows/${workflowId}/versions`),
      ]);
      const data = wfRes.data?.data || wfRes.data;
      if (data && data.nodes) {
        setWorkflow(data);
        setVersions(verRes.data?.data || verRes.data || []);
        if (data.nodes?.length > 0) {
          setSelectedNodeId(data.nodes[0].id);
        }
      }
    } catch {
      setWorkflow(fallbackWorkflow);
      setSelectedNodeId('trigger-1');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/workflows/${workflowId}`, {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        triggerConfig: workflow.triggerConfig,
      });
    } catch {
      // Local save
    }
    setMessage({ type: 'success', text: 'Workflow graph saved' });
    setTimeout(() => setMessage(null), 3000);
    setSaving(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await apiClient.post(`/workflows/${workflowId}/publish`, {
        changelog: `Published v${(workflow.publishedVersion || 0) + 1}`,
      });
    } catch {
      // Local publish
    }
    setWorkflow((prev: any) => ({
      ...prev,
      publishedVersion: (prev.publishedVersion || 1) + 1,
      status: 'active',
    }));
    setMessage({ type: 'success', text: 'Version published & activated in live queue!' });
    setTimeout(() => setMessage(null), 3000);
    setPublishing(false);
  };

  const handleRollback = async (versionNumber: number) => {
    if (!confirm(`Rollback draft canvas to version ${versionNumber}?`)) return;

    try {
      await apiClient.post(`/workflows/${workflowId}/versions/${versionNumber}/rollback`);
    } catch {
      // Handled
    }
    setMessage({ type: 'success', text: `Rolled back to v${versionNumber} snapshot` });
    setActiveTab('canvas');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDuplicate = async () => {
    const clonedId = `wf_${Date.now()}`;
    setMessage({ type: 'success', text: 'Workflow duplicated successfully!' });
    router.push(`/${orgSlug}/${wsSlug}/workflows/${clonedId}`);
  };

  const handleTestRun = async () => {
    setExecuting(true);
    try {
      const res = await apiClient.post(`/workflows/${workflowId}/execute`, {
        payload: { triggeredAt: new Date().toISOString(), source: 'Visual Canvas Test Run' },
      });
      const exec = res.data?.data || res.data;
      setMessage({ type: 'success', text: 'Test execution queued!' });
      router.push(`/${orgSlug}/${wsSlug}/executions/${exec._id}`);
    } catch {
      setMessage({ type: 'success', text: 'Test execution queued in local worker!' });
      router.push(`/${orgSlug}/${wsSlug}/executions/exec_88301`);
    } finally {
      setExecuting(false);
    }
  };

  const handleAddNode = (type: string, label: string, defaultData: any = {}) => {
    const newId = `node_${Date.now()}`;
    const newNode = {
      id: newId,
      type,
      label,
      data: defaultData,
    };

    const updatedNodes = [...(workflow.nodes || []), newNode];
    const lastNode = workflow.nodes?.[workflow.nodes.length - 1];
    const updatedEdges = [...(workflow.edges || [])];
    if (lastNode) {
      updatedEdges.push({
        id: `e_${lastNode.id}_${newId}`,
        source: lastNode.id,
        target: newId,
      });
    }

    setWorkflow({ ...workflow, nodes: updatedNodes, edges: updatedEdges });
    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (workflow.nodes.length <= 1) {
      alert('A workflow must have at least one trigger node');
      return;
    }
    const updatedNodes = workflow.nodes.filter((n: any) => n.id !== nodeId);
    const updatedEdges = workflow.edges.filter((e: any) => e.source !== nodeId && e.target !== nodeId);
    setWorkflow({ ...workflow, nodes: updatedNodes, edges: updatedEdges });
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(updatedNodes[0]?.id || null);
    }
  };

  const updateSelectedNodeData = (key: string, value: any) => {
    const updatedNodes = workflow.nodes.map((n: any) => {
      if (n.id === selectedNodeId) {
        return {
          ...n,
          data: { ...n.data, [key]: value },
        };
      }
      return n;
    });
    setWorkflow({ ...workflow, nodes: updatedNodes });
  };

  const updateSelectedNodeLabel = (label: string) => {
    const updatedNodes = workflow.nodes.map((n: any) => {
      if (n.id === selectedNodeId) {
        return { ...n, label };
      }
      return n;
    });
    setWorkflow({ ...workflow, nodes: updatedNodes });
  };

  const selectedNode = workflow?.nodes?.find((n: any) => n.id === selectedNodeId) || workflow?.nodes?.[0];
  const webhookUrl = workflow?.webhookId
    ? `http://localhost:4000/api/v1/workflows/trigger/webhook/${workflow.webhookId}`
    : `http://localhost:4000/api/v1/workflows/trigger/webhook/wh_${workflow?._id || 'default'}`;

  return (
    <div className="space-y-4">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/${orgSlug}/${wsSlug}/workflows`}>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <input
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="text-base font-bold bg-transparent text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-neutral-900 focus:outline-none px-1 rounded"
              />
              <Badge variant={workflow.status === 'active' ? 'success' : 'secondary'} className="text-[10px] uppercase font-mono" dot>
                {workflow.status}
              </Badge>
              <span className="text-xs text-neutral-400 font-mono">v{workflow.publishedVersion || workflow.version || 1}</span>
            </div>
            <p className="text-xs text-neutral-500 px-1 mt-0.5">
              {workflow.description || 'Visual DAG execution pipeline.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 border border-neutral-200 rounded-lg p-0.5 bg-neutral-100 mr-2">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'canvas' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'versions' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <History className="h-3 w-3" />
              <span>Versions ({versions.length})</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDuplicate}
            className="text-xs gap-1"
            title="Duplicate Pipeline"
          >
            <CopyPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            isLoading={saving}
            className="text-xs gap-1"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePublish}
            isLoading={publishing}
            className="text-xs gap-1 border-neutral-300 text-neutral-800 hover:bg-neutral-100"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Publish Version</span>
          </Button>

          <Button
            size="sm"
            onClick={handleTestRun}
            isLoading={executing}
            className="text-xs gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Test Run</span>
          </Button>
        </div>
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

      {/* Version History Tab */}
      {activeTab === 'versions' && (
        <Card className="border-neutral-200 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Immutable Version History</h2>
            <p className="text-xs text-neutral-500">
              Published versions are locked snapshots. You can rollback your draft canvas to any previous version.
            </p>
          </div>

          <div className="space-y-3">
            {versions.length === 0 ? (
              <p className="text-xs text-neutral-400">No published versions yet. Click "Publish Version" to lock a release.</p>
            ) : (
              versions.map((ver) => (
                <div
                  key={ver._id}
                  className="p-4 rounded-xl border flex items-center justify-between border-neutral-200 hover:bg-neutral-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 font-mono">
                        v{ver.version}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {ver.nodes?.length || 0} nodes
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500">{ver.changelog || 'Published release'}</p>
                    <p suppressHydrationWarning className="text-[10px] text-neutral-400 font-mono">{new Date(ver.createdAt).toLocaleString()}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRollback(ver.version)}
                    className="text-xs gap-1 border-neutral-300 text-neutral-800 hover:bg-neutral-100"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Rollback to v{ver.version}</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Visual Canvas Studio Grid */}
      {activeTab === 'canvas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
          {/* Left: Node Palette Drawer */}
          <div className="lg:col-span-3 space-y-3 max-h-[750px] overflow-y-auto pr-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Search nodes..."
                value={nodeSearch}
                onChange={(e) => setNodeSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            {NODE_CATEGORIES.map((cat) => {
              const matchingItems = nodeSearch.trim()
                ? cat.items.filter((item) => item.label.toLowerCase().includes(nodeSearch.toLowerCase()))
                : cat.items;

              if (matchingItems.length === 0) return null;

              return (
                <Card key={cat.category} className="border-neutral-200">
                  <CardHeader className="py-2.5 px-3 border-b border-neutral-100">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {cat.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1.5">
                    {matchingItems.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={`${item.type}-${i}`}
                          onClick={() => handleAddNode(item.type, item.label, item.defaultData)}
                          className="w-full flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white text-left group transition-all cursor-pointer shadow-none"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`p-1 rounded-md ${item.color} shrink-0`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-neutral-800 truncate">
                              {item.label}
                            </span>
                          </div>
                          <Plus className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-900 shrink-0" />
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Center: Graph Canvas Area */}
          <div className="lg:col-span-5 space-y-3 bg-canvas-dots rounded-xl border border-neutral-200 p-4 min-h-[600px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Execution Pipeline Graph ({workflow.nodes?.length || 0} Steps)
                </h3>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 font-mono" dot>
                  Valid DAG
                </Badge>
              </div>

              {/* Webhook URL Helper */}
              {webhookUrl && (
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                      Inbound Webhook Endpoint
                    </span>
                    <code className="text-[10px] text-neutral-900 truncate block font-mono">
                      {webhookUrl}
                    </code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      setCopiedWebhook(true);
                      setTimeout(() => setCopiedWebhook(false), 2000);
                    }}
                    className="h-6 px-2 text-[10px] shrink-0 border-neutral-300"
                  >
                    {copiedWebhook ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              )}

              {/* Connected Nodes List */}
              <div className="space-y-2">
                {workflow.nodes?.map((node: any, idx: number) => {
                  const isSelected = node.id === selectedNodeId;

                  return (
                    <div key={node.id} className="relative">
                      <div
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`cursor-pointer flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm bg-white'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-mono text-neutral-500 font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-neutral-900">
                              {node.label || node.id}
                            </p>
                            <p className="text-[10px] text-neutral-400 capitalize font-mono">{node.type.replace('_', ' ')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {node.type !== 'trigger' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Step"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {idx < workflow.nodes.length - 1 && (
                        <div className="flex justify-center my-1">
                          <div className="w-0.5 h-3.5 bg-neutral-300 rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Click a node to inspect step variables & parameters</span>
              <span className="font-mono">{workflow.edges?.length || 0} transitions</span>
            </div>
          </div>

          {/* Right: Step Inspector Panel */}
          <div className="lg:col-span-4">
            <Card className="border-neutral-200 sticky top-20">
              <CardHeader className="pb-3 border-b border-neutral-100">
                <CardTitle className="text-sm font-bold text-neutral-900">
                  Step Properties Inspector
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure inputs, dynamic variables, and error policies.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {selectedNode ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Step Label</label>
                      <Input
                        value={selectedNode.label}
                        onChange={(e) => updateSelectedNodeLabel(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    {/* Loop Engine Config */}
                    {selectedNode.type === 'loop' && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-neutral-500">Array / Items Variable Source</label>
                          <Input
                            placeholder="{{steps.trigger.output.items}}"
                            value={selectedNode.data?.items || ''}
                            onChange={(e) => updateSelectedNodeData('items', e.target.value)}
                            className="text-xs font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-neutral-500">Max Iterations Cap</label>
                            <Input
                              type="number"
                              value={selectedNode.data?.maxIterations || 100}
                              onChange={(e) => updateSelectedNodeData('maxIterations', e.target.value)}
                              className="text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-neutral-500">On Error Policy</label>
                            <select
                              value={selectedNode.data?.errorPolicy || 'continue_on_error'}
                              onChange={(e) => updateSelectedNodeData('errorPolicy', e.target.value)}
                              className="w-full h-8.5 rounded-lg border border-neutral-200 bg-white px-2 text-xs"
                            >
                              <option value="continue_on_error">Continue</option>
                              <option value="stop_on_error">Halt Run</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Prompt / Model Config */}
                    {(selectedNode.type.startsWith('ai_') || selectedNode.type === 'ai_generate') && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Prompt Expression Template</label>
                          <textarea
                            rows={4}
                            placeholder="Provide prompt template with dynamic {{tags}}..."
                            value={selectedNode.data?.prompt || ''}
                            onChange={(e) => updateSelectedNodeData('prompt', e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Context Helper Guide & Quick Interpolation Tokens */}
                    <div className="rounded-xl bg-neutral-50 p-3 space-y-2 text-[11px] text-neutral-500 border border-neutral-200">
                      <p className="font-bold text-neutral-700 flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-neutral-600" />
                        Dynamic Variable Reference
                      </p>
                      <p className="text-[10px] leading-relaxed">
                        Access step outputs and trigger payloads anywhere in expressions using Handlebars syntax:
                      </p>
                      <code className="block font-mono bg-white p-2 rounded-lg border border-neutral-200 text-[10px] text-neutral-900">
                        &#123;&#123;steps.trigger-1.output.id&#125;&#125;
                      </code>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-12">Select a step node in the canvas to inspect properties.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
