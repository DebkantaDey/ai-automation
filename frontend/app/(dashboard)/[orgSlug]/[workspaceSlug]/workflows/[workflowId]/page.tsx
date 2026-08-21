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
      { type: 'trigger', label: 'Inbound Webhook', icon: Zap, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', defaultData: { triggerType: 'webhook' } },
      { type: 'trigger', label: 'Schedule (Cron)', icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40', defaultData: { triggerType: 'schedule', cron: '0 9 * * 1-5' } },
    ],
  },
  {
    category: 'Logic & Flow',
    items: [
      { type: 'condition_branch', label: 'Condition / Filter', icon: GitFork, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', defaultData: { matchType: 'all', rules: [{ field: '{{trigger.score}}', operator: '>', value: '80' }] } },
      { type: 'loop', label: 'Safe Loop Engine', icon: Repeat, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40', defaultData: { items: '{{steps.trigger.output.items}}', maxIterations: 100, itemTemplate: 'Item {{index}}: {{item}}' } },
      { type: 'human_approval', label: 'Human Approval Gate', icon: UserCheck, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40', defaultData: { requiredRole: 'Manager', message: 'Review required' } },
      { type: 'delay', label: 'Delay Timer', icon: Clock, color: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800', defaultData: { seconds: '5' } },
      { type: 'transformer_code', label: 'Data Transformer', icon: Code2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', defaultData: { template: '{{steps.trigger.output}}' } },
    ],
  },
  {
    category: 'AI Specialists',
    items: [
      { type: 'ai_generate', label: 'AI Generate (LLM)', icon: Sparkles, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40', defaultData: { prompt: 'Generate summary of {{steps.trigger.output}}', provider: 'openai' } },
      { type: 'ai_classify', label: 'AI Classifier', icon: Split, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40', defaultData: { prompt: '{{steps.trigger.output.text}}', categories: ['High Urgency', 'Normal', 'Spam'] } },
      { type: 'ai_extract', label: 'AI Entity Extraction', icon: Code2, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40', defaultData: { prompt: '{{steps.trigger.output.body}}', fields: ['name', 'email', 'company', 'budget'] } },
    ],
  },
  {
    category: 'Actions & Apps',
    items: [
      { type: 'http_request', label: 'HTTP REST Request', icon: Globe, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40', defaultData: { method: 'POST', url: 'https://api.example.com/v1/event' } },
      { type: 'action_slack', label: 'Slack Notification', icon: Send, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', defaultData: { action: 'send_message', params: { text: 'Notification from workflow: {{workflow.name}}' } } },
      { type: 'action_gmail', label: 'Send Email', icon: Mail, color: 'text-red-600 bg-red-50 dark:bg-red-950/40', defaultData: { action: 'send_email', params: { to: '{{trigger.email}}', subject: 'Automation Update', body: 'Hello!' } } },
      { type: 'action_sheets', label: 'Google Sheets Append', icon: Table, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', defaultData: { action: 'append_row', params: { spreadsheetId: '1AbCd...', range: 'Sheet1!A:E', values: ['{{trigger.date}}', '{{trigger.name}}'] } } },
      { type: 'action_hubspot', label: 'HubSpot Create Contact', icon: Building, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', defaultData: { action: 'create_contact', params: { email: '{{trigger.email}}', firstname: '{{trigger.firstname}}' } } },
    ],
  },
];

export default function AdvancedWorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';
  const workflowId = params?.workflowId as string;

  const [workflow, setWorkflow] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'canvas' | 'versions'>('canvas');
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
      setWorkflow(data);
      setVersions(verRes.data?.data || verRes.data || []);
      if (data.nodes?.length > 0) {
        setSelectedNodeId(data.nodes[0].id);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load workflow' });
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
      setMessage({ type: 'success', text: 'Workflow graph saved' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await apiClient.post(`/workflows/${workflowId}/publish`, {
        changelog: `Published v${(workflow.publishedVersion || 0) + 1}`,
      });
      setWorkflow(res.data?.data || res.data);
      setMessage({ type: 'success', text: 'Version published & activated!' });
      await loadWorkflow();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Publish failed' });
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (versionNumber: number) => {
    if (!confirm(`Rollback draft canvas to version ${versionNumber}?`)) return;

    try {
      const res = await apiClient.post(`/workflows/${workflowId}/versions/${versionNumber}/rollback`);
      setWorkflow(res.data?.data || res.data);
      setMessage({ type: 'success', text: `Rolled back to v${versionNumber} snapshot` });
      setActiveTab('canvas');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rollback failed' });
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await apiClient.post(`/workflows/${workflowId}/duplicate`);
      const cloned = res.data?.data || res.data;
      setMessage({ type: 'success', text: 'Workflow duplicated successfully!' });
      router.push(`/${orgSlug}/${wsSlug}/workflows/${cloned._id}`);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Duplicate failed' });
    }
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Test run failed' });
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

  if (loading || !workflow) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-xs text-neutral-500 animate-pulse">Loading visual workflow graph canvas...</p>
      </div>
    );
  }

  const selectedNode = workflow.nodes?.find((n: any) => n.id === selectedNodeId);
  const webhookUrl = workflow.webhookId
    ? `http://localhost:4000/api/v1/workflows/trigger/webhook/${workflow.webhookId}`
    : null;

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Action Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
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
                className="text-lg font-bold bg-transparent text-neutral-900 dark:text-white border-b border-transparent hover:border-neutral-300 focus:border-blue-500 focus:outline-none px-1"
              />
              <Badge variant={workflow.status === 'active' ? 'success' : 'secondary'} className="text-[10px] uppercase font-mono">
                {workflow.status}
              </Badge>
              <span className="text-xs text-neutral-400 font-mono">v{workflow.publishedVersion || workflow.version || 1}</span>
            </div>
            <p className="text-xs text-neutral-500 px-1 mt-0.5">
              {workflow.description || 'Drag and configure steps to automate your business.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 border rounded-lg p-0.5 bg-neutral-100 dark:bg-neutral-800 mr-2">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeTab === 'canvas' ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                activeTab === 'versions' ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'
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
            title="Duplicate Workflow"
          >
            <CopyPlus className="h-3.5 w-3.5" />
            <span>Duplicate</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="text-xs gap-1"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePublish}
            disabled={publishing}
            className="text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{publishing ? 'Publishing...' : 'Publish Version'}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleTestRun}
            disabled={executing}
            className="text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{executing ? 'Running...' : 'Test Run'}</span>
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
          }`}
        >
          <span>{message.text}</span>
        </div>
      )}

      {/* Version History View */}
      {activeTab === 'versions' && (
        <Card className="border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Immutable Version History</h2>
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
                  className="p-4 rounded-lg border flex items-center justify-between border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
                        v{ver.version}
                      </span>
                      <span className="text-xs text-neutral-400">({ver.nodes?.length || 0} nodes)</span>
                    </div>
                    <p className="text-xs text-neutral-500">{ver.changelog || 'Published release'}</p>
                    <p className="text-[10px] text-neutral-400">{new Date(ver.createdAt).toLocaleString()}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRollback(ver.version)}
                    className="text-xs gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
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

      {/* Interactive Builder Canvas View */}
      {activeTab === 'canvas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
          {/* Left: Categorized Node Palette */}
          <div className="lg:col-span-3 space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {NODE_CATEGORIES.map((cat) => (
              <Card key={cat.category} className="border-neutral-200 dark:border-neutral-800">
                <CardHeader className="py-2.5 px-3 border-b border-neutral-100 dark:border-neutral-800">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    {cat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1.5">
                  {cat.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={`${item.type}-${i}`}
                        onClick={() => handleAddNode(item.type, item.label, item.defaultData)}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 bg-white dark:bg-neutral-900 text-left group transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md ${item.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                            {item.label}
                          </span>
                        </div>
                        <Plus className="h-3 w-3 text-neutral-400 group-hover:text-blue-600" />
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Center: Graph Step Pipeline */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Connected Execution Pipeline
              </h3>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Valid Graph
              </Badge>
            </div>

            <div className="space-y-2.5">
              {workflow.nodes?.map((node: any, idx: number) => {
                const isSelected = node.id === selectedNodeId;

                return (
                  <div key={node.id} className="relative">
                    <div
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`cursor-pointer flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-600 shadow-md bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-500">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">
                            {node.label || node.id}
                          </p>
                          <p className="text-[10px] text-neutral-400 capitalize">{node.type.replace('_', ' ')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {node.type !== 'trigger' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(node.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {idx < workflow.nodes.length - 1 && (
                      <div className="flex justify-center my-1">
                        <div className="w-0.5 h-3 bg-neutral-300 dark:bg-neutral-700" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Step Property Config Drawer */}
          <div className="lg:col-span-4">
            <Card className="border-neutral-200 dark:border-neutral-800 sticky top-4">
              <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">
                  Step Properties
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure inputs, loop limits, and variable interpolations.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {selectedNode ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase text-neutral-500">Step Name</label>
                      <Input
                        value={selectedNode.label}
                        onChange={(e) => updateSelectedNodeLabel(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    {/* Loop Configuration */}
                    {selectedNode.type === 'loop' && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-neutral-500">Array / Items Source</label>
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
                            <label className="text-[11px] font-semibold text-neutral-500">On Item Error</label>
                            <select
                              value={selectedNode.data?.errorPolicy || 'continue_on_error'}
                              onChange={(e) => updateSelectedNodeData('errorPolicy', e.target.value)}
                              className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 text-xs"
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
                          <label className="text-[11px] font-semibold text-neutral-500">Prompt Expression</label>
                          <textarea
                            rows={4}
                            placeholder="Provide prompt template..."
                            value={selectedNode.data?.prompt || ''}
                            onChange={(e) => updateSelectedNodeData('prompt', e.target.value)}
                            className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Context Helper Guide */}
                    <div className="rounded-lg bg-neutral-100/70 dark:bg-neutral-900/60 p-3 space-y-1.5 text-[11px] text-neutral-500">
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                        <HelpCircle className="h-3 w-3 text-blue-500" />
                        Dynamic Variables
                      </p>
                      <code className="block font-mono bg-white dark:bg-neutral-950 p-1.5 rounded border text-[10px]">
                        &#123;&#123;steps.trigger-1.output.id&#125;&#125;
                      </code>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-8">Select a step to inspect properties.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
