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

  const [execution, setExecution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'steps' | 'payload' | 'ai'>('steps');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadExecution = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/workflows/executions/${executionId}`);
      const data = res.data?.data || res.data;
      setExecution(data);
      if (data.steps?.length > 0) {
        setSelectedStepId(data.steps[0].nodeId);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load execution trace' });
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
      setMessage({ type: 'success', text: 'Execution approved and resumed successfully!' });
      await loadExecution();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Approval failed' });
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await apiClient.post(`/workflows/executions/${executionId}/reject`, {
        reason: 'Rejected from Execution Debugger',
      });
      setMessage({ type: 'success', text: 'Execution rejected and cancelled' });
      await loadExecution();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rejection failed' });
    } finally {
      setActing(false);
    }
  };

  if (loading || !execution) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-xs text-neutral-500 animate-pulse">Loading execution debugger trace...</p>
      </div>
    );
  }

  const selectedStep = execution.steps?.find((s: any) => s.nodeId === selectedStepId);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/${orgSlug}/${wsSlug}/executions`}>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {execution.workflowId?.name || 'Automation Execution'}
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
              >
                {execution.status}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              ID: {execution._id} • Trigger: {execution.triggerType} • Started:{' '}
              {new Date(execution.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {execution.workflowId?._id && (
            <Link href={`/${orgSlug}/${wsSlug}/workflows/${execution.workflowId._id}`}>
              <Button size="sm" variant="outline" className="text-xs gap-1">
                <span>Edit Workflow</span>
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
          <span>{message.text}</span>
        </div>
      )}

      {/* Human Approval Pending Banner */}
      {execution.status === 'waiting_approval' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Required: Human Approval Needed
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This workflow reached a sensitive gate step and requires an operator with role [
                <strong>{execution.approvalDetails?.requiredRole || 'Manager'}</strong>] to approve.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={acting}
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve & Continue</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={acting}
              onClick={handleReject}
              className="border-red-300 text-red-600 hover:bg-red-50 text-xs gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </Button>
          </div>
        </div>
      )}

      {/* Overview Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-3 border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-500">Duration</span>
          <p className="text-base font-bold font-mono text-neutral-900 dark:text-white">
            {execution.durationMs ? `${execution.durationMs}ms` : '—'}
          </p>
        </Card>

        <Card className="p-3 border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-500">Steps Executed</span>
          <p className="text-base font-bold text-neutral-900 dark:text-white">
            {execution.steps?.filter((s: any) => s.status === 'completed').length} / {execution.steps?.length || 0}
          </p>
        </Card>

        <Card className="p-3 border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-500">Total AI Tokens</span>
          <p className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono">
            {execution.aiUsage?.totalTokens?.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="p-3 border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-500">AI Cost</span>
          <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ${execution.aiUsage?.costUsd ? execution.aiUsage.costUsd.toFixed(4) : '0.0000'}
          </p>
        </Card>
      </div>

      {/* Main Debugger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
        {/* Left: Step Trace List */}
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Step Execution Pipeline
          </h3>

          <div className="space-y-2">
            {execution.steps?.map((step: any, idx: number) => {
              const isSelected = step.nodeId === selectedStepId;

              return (
                <div
                  key={step.nodeId}
                  onClick={() => setSelectedStepId(step.nodeId)}
                  className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-600'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-500">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        {step.nodeLabel || step.nodeId}
                      </p>
                      <p className="text-[10px] text-neutral-400 capitalize">{step.nodeType.replace('_', ' ')}</p>
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
                          ? 'outline'
                          : 'secondary'
                      }
                      className="text-[9px] capitalize"
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
          <Card className="border-neutral-200 dark:border-neutral-800 h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Step Trace: {selectedStep?.nodeLabel || selectedStep?.nodeId || 'Details'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspect resolved input parameters and runtime response output.
                </CardDescription>
              </div>

              <div className="flex gap-1 border rounded-md p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
                <button
                  onClick={() => setActiveTab('steps')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'steps' ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'
                  }`}
                >
                  Step Data
                </button>
                <button
                  onClick={() => setActiveTab('payload')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
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
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 space-y-1">
                      <p className="font-semibold flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Step Execution Error
                      </p>
                      <pre className="font-mono text-[11px] whitespace-pre-wrap">{selectedStep.error}</pre>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase text-neutral-500">Input Data</span>
                    <pre className="p-3 rounded-lg bg-neutral-950 text-neutral-100 font-mono text-[11px] overflow-x-auto max-h-48">
                      {JSON.stringify(selectedStep.input || {}, null, 2)}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase text-neutral-500">Output Result</span>
                    <pre className="p-3 rounded-lg bg-neutral-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64">
                      {JSON.stringify(selectedStep.output || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'payload' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold uppercase text-neutral-500">Initial Trigger Payload</span>
                  <pre className="p-3 rounded-lg bg-neutral-950 text-neutral-100 font-mono text-[11px] overflow-x-auto max-h-96">
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
