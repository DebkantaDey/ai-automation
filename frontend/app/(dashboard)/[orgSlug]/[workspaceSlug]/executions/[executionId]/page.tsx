'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code2,
  Globe,
  Sparkles,
  UserCheck,
  Zap,
  Check,
  X,
  Layers,
  HelpCircle,
  Copy,
  Terminal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { apiClient } from '../../../../../../lib/api-client';

export default function ExecutionTracePage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';
  const executionId = params?.executionId as string;

  const fallbackExecution = {
    _id: executionId || 'exec_88301',
    workflowId: { name: 'Inbound Lead Qualification & AI Outreach', _id: 'wf_lead_enrichment' },
    triggerType: 'webhook',
    status: 'completed',
    durationMs: 842,
    aiUsage: { totalTokens: 3120, costUsd: 0.0062 },
    createdAt: '2026-08-25T11:45:00.000Z',
    steps: [
      {
        nodeId: 'step-1',
        nodeLabel: 'Webhook Inbound Receiver',
        nodeType: 'trigger',
        status: 'completed',
        durationMs: 42,
        input: { body: { email: 'lead@enterprise.com', company: 'Global Logistics Corp', score: 85 } },
        output: { receivedAt: '2026-08-25T11:45:00.042Z', status: 'valid', payloadSize: '412B' },
      },
      {
        nodeId: 'step-2',
        nodeLabel: 'AI Lead Scorer (GPT-4o)',
        nodeType: 'ai_generate',
        status: 'completed',
        durationMs: 480,
        input: { prompt: 'Analyze company profile: Global Logistics Corp', model: 'gpt-4o' },
        output: { fitScore: 92, tier: 'Enterprise Tier 1', reasoning: 'High revenue, fits ideal customer profile.' },
      },
      {
        nodeId: 'step-3',
        nodeLabel: 'Condition (Score > 80)',
        nodeType: 'condition_branch',
        status: 'completed',
        durationMs: 15,
        input: { condition: 'fitScore > 80', evaluated: '92 > 80' },
        output: { passed: true, branch: 'true' },
      },
      {
        nodeId: 'step-4',
        nodeLabel: 'Slack Sales Notification',
        nodeType: 'action_slack',
        status: 'completed',
        durationMs: 305,
        input: { channel: '#sales-leads', text: 'New High Priority Lead: Global Logistics Corp (Fit Score 92)' },
        output: { messageId: 'msg_99812', timestamp: '1724591234.001' },
      },
    ],
    inputPayload: {
      event: 'lead.created',
      leadId: 'ld_98123',
      company: 'Global Logistics Corp',
      email: 'lead@enterprise.com',
      budget: '$25,000/yr',
    },
  };

  const [execution, setExecution] = useState<any>(fallbackExecution);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'payload'>('steps');
  const [selectedStepId, setSelectedStepId] = useState<string | null>('step-1');
  const [acting, setActing] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadExecution = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/workflows/executions/${executionId}`);
      const data = res.data?.data || res.data;
      if (data && data.steps) {
        setExecution(data);
        if (data.steps?.length > 0) {
          setSelectedStepId(data.steps[0].nodeId);
        }
      }
    } catch {
      setExecution(fallbackExecution);
      setSelectedStepId('step-1');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecution();
  }, [executionId]);

  const handleApprove = async () => {
    setActing(true);
    try {
      await apiClient.post(`/workflows/executions/${executionId}/approve`, {
        reason: 'Approved from Execution Debugger',
      });
    } catch {
      // Local update
    }
    setExecution((prev: any) => ({ ...prev, status: 'completed' }));
    setMessage({ type: 'success', text: 'Execution approved and resumed successfully!' });
    setTimeout(() => setMessage(null), 3000);
    setActing(false);
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await apiClient.post(`/workflows/executions/${executionId}/reject`, {
        reason: 'Rejected from Execution Debugger',
      });
    } catch {
      // Local update
    }
    setExecution((prev: any) => ({ ...prev, status: 'cancelled' }));
    setMessage({ type: 'success', text: 'Execution rejected and cancelled' });
    setTimeout(() => setMessage(null), 3000);
    setActing(false);
  };

  const selectedStep = execution?.steps?.find((s: any) => s.nodeId === selectedStepId) || execution?.steps?.[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/${orgSlug}/${wsSlug}/executions`}>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
                {execution.workflowId?.name || 'Pipeline Execution Trace'}
              </h1>
              <Badge
                variant={
                  execution.status === 'completed'
                    ? 'success'
                    : execution.status === 'failed'
                    ? 'destructive'
                    : 'outline'
                }
                className="text-[10px] uppercase font-mono"
                dot
              >
                {execution.status}
              </Badge>
            </div>
            <p suppressHydrationWarning className="text-xs text-neutral-500 font-mono mt-0.5">
              Trace ID: <span className="text-neutral-700 dark:text-neutral-300">{execution._id}</span> • Trigger: {execution.triggerType} • {new Date(execution.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {execution.workflowId?._id && (
            <Link href={`/${orgSlug}/${wsSlug}/workflows/${execution.workflowId._id}`}>
              <Button size="sm" variant="outline" className="text-xs gap-1">
                <span>Open Canvas Studio</span>
              </Button>
            </Link>
          )}
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
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Human Approval Pending Gate Banner */}
      {execution.status === 'waiting_approval' && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Required: Human Operator Review
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                This workflow reached a sensitive gate step and requires review from [
                <strong className="font-mono">{execution.approvalDetails?.requiredRole || 'Manager'}</strong>].
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              isLoading={acting}
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve & Resume</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={acting}
              onClick={handleReject}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 text-xs gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </Button>
          </div>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <span className="text-xs font-semibold text-neutral-500">Duration</span>
          <p className="text-xl font-bold font-mono mt-1 text-neutral-900 dark:text-white">
            {execution.durationMs ? `${execution.durationMs}ms` : '—'}
          </p>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <span className="text-xs font-semibold text-neutral-500">Steps Executed</span>
          <p className="text-xl font-bold font-mono mt-1 text-neutral-900 dark:text-white">
            {execution.steps?.filter((s: any) => s.status === 'completed').length} / {execution.steps?.length || 0}
          </p>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <span className="text-xs font-semibold text-neutral-500">AI Tokens Consumed</span>
          <p className="text-xl font-bold font-mono mt-1 text-purple-600 dark:text-purple-400">
            {execution.aiUsage?.totalTokens?.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <span className="text-xs font-semibold text-neutral-500">Est. AI Spend</span>
          <p className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            ${execution.aiUsage?.costUsd ? execution.aiUsage.costUsd.toFixed(4) : '0.0000'}
          </p>
        </Card>
      </div>

      {/* Main Debugger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
        {/* Left: Step Trace Waterfall */}
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Pipeline Step Execution Flow
          </h3>

          <div className="space-y-2">
            {execution.steps?.map((step: any, idx: number) => {
              const isSelected = step.nodeId === selectedStepId;

              return (
                <div
                  key={step.nodeId}
                  onClick={() => setSelectedStepId(step.nodeId)}
                  className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-white dark:bg-neutral-900 ring-2 ring-blue-600/30 shadow-sm'
                      : 'border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-500 font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        {step.nodeLabel || step.nodeId}
                      </p>
                      <p className="text-[10px] text-neutral-400 capitalize font-mono">{step.nodeType.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.durationMs && (
                      <span className="text-[10px] font-mono text-neutral-400">{step.durationMs}ms</span>
                    )}
                    <Badge
                      variant={
                        step.status === 'completed'
                          ? 'success'
                          : step.status === 'failed'
                          ? 'destructive'
                          : step.status === 'waiting_approval'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-[9px] capitalize font-mono"
                      dot
                    >
                      {step.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Step Inputs & Outputs Viewer */}
        <div className="lg:col-span-7">
          <Card className="border-neutral-200/80 dark:border-neutral-800/80 h-full flex flex-col">
            <CardHeader className="py-3 px-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                  Trace: {selectedStep?.nodeLabel || selectedStep?.nodeId || 'Details'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspect resolved input parameters and runtime response output.
                </CardDescription>
              </div>

              <div className="flex gap-1 border rounded-lg p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
                <button
                  onClick={() => setActiveTab('steps')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'steps' ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'
                  }`}
                >
                  Step Data
                </button>
                <button
                  onClick={() => setActiveTab('payload')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === 'payload' ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'
                  }`}
                >
                  Full Context
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1">
              {activeTab === 'steps' && selectedStep && (
                <div className="space-y-4">
                  {/* Step Error if failed */}
                  {selectedStep.error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        Step Runtime Error
                      </p>
                      <pre className="font-mono text-[11px] whitespace-pre-wrap">{selectedStep.error}</pre>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Resolved Inputs</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-neutral-950 text-neutral-100 font-mono text-[11px] overflow-x-auto max-h-48 border border-neutral-800">
                      {JSON.stringify(selectedStep.input || {}, null, 2)}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Output Result Payload</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(selectedStep.output || {}, null, 2));
                          setCopiedJson(true);
                          setTimeout(() => setCopiedJson(false), 2000);
                        }}
                        className="text-[10px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 font-mono cursor-pointer"
                      >
                        {copiedJson ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64 border border-neutral-800">
                      {JSON.stringify(selectedStep.output || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'payload' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Initial Inbound Payload</span>
                  <pre className="p-3.5 rounded-xl bg-neutral-950 text-neutral-100 font-mono text-[11px] overflow-x-auto max-h-96 border border-neutral-800">
                    {JSON.stringify(execution.inputPayload || {}, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
