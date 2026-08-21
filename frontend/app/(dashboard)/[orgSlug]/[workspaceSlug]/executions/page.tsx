'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Layers,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Search,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { apiClient } from '../../../../../lib/api-client';

export default function ExecutionsHistoryPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/workflows/executions');
      setExecutions(res.data?.data || res.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load execution history' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, [orgSlug]);

  const handleApprove = async (executionId: string) => {
    setActingId(executionId);
    try {
      await apiClient.post(`/workflows/executions/${executionId}/approve`, {
        reason: 'Approved via dashboard execution monitor',
      });
      setMessage({ type: 'success', text: 'Workflow execution approved and resumed!' });
      await loadExecutions();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to approve execution' });
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (executionId: string) => {
    setActingId(executionId);
    try {
      await apiClient.post(`/workflows/executions/${executionId}/reject`, {
        reason: 'Rejected via dashboard execution monitor',
      });
      setMessage({ type: 'success', text: 'Workflow execution rejected and cancelled' });
      await loadExecutions();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject execution' });
    } finally {
      setActingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-[10px] uppercase font-mono">Completed</Badge>;
      case 'running':
        return <Badge variant="outline" className="text-[10px] uppercase font-mono text-blue-600 border-blue-300 animate-pulse">Running</Badge>;
      case 'waiting_approval':
        return <Badge variant="outline" className="text-[10px] uppercase font-mono text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40">Waiting Approval</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-[10px] uppercase font-mono">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Workflow Executions
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor real-time workflow runs, step traces, AI token consumption, and manage human approvals.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadExecutions}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
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

      {/* Executions Table */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-xs text-neutral-500 animate-pulse">Loading executions...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Layers className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-700" />
              <p className="text-xs text-neutral-500">No workflow executions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium bg-neutral-50/50 dark:bg-neutral-900/50">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Workflow Name</th>
                    <th className="py-3 px-4">Trigger</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">AI Tokens</th>
                    <th className="py-3 px-4">Started At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {executions.map((exec) => (
                    <tr
                      key={exec._id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      <td className="py-3 px-4">{getStatusBadge(exec.status)}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/${orgSlug}/${wsSlug}/executions/${exec._id}`}
                          className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 transition-colors"
                        >
                          {exec.workflowId?.name || 'Automation Workflow'}
                        </Link>
                      </td>
                      <td className="py-3 px-4 capitalize text-neutral-500">{exec.triggerType}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                        {exec.durationMs ? `${exec.durationMs}ms` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {exec.aiUsage?.totalTokens ? (
                          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-mono text-[11px] font-medium">
                            <Sparkles className="h-3 w-3" />
                            {exec.aiUsage.totalTokens.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 text-[11px]">
                        {new Date(exec.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {exec.status === 'waiting_approval' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actingId === exec._id}
                              onClick={() => handleApprove(exec._id)}
                              className="h-6 px-2 text-[11px] bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actingId === exec._id}
                              onClick={() => handleReject(exec._id)}
                              className="h-6 px-2 text-[11px] bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Link href={`/${orgSlug}/${wsSlug}/executions/${exec._id}`}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700">
                              <span>Trace</span>
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
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
    </div>
  );
}
