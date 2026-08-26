'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  Database,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { apiClient } from '../../../../../lib/api-client';

const fallbackAnalytics = {
  business: {
    totalWorkflows: 14,
    activeWorkflows: 11,
    totalExecutions: 2115,
    completedExecutions: 2102,
    failedExecutions: 13,
    waitingApprovalExecutions: 2,
    successRate: 99.4,
  },
  ai: {
    aiTotalTokens: 921000,
    aiExecutions: 450,
    estimatedCostUsd: 8.45,
  },
  quotas: {
    workflows: { current: 14, limit: 25, percent: 56 },
    monthlyExecutions: { current: 2115, limit: 10000, percent: 21.1 },
    monthlyAiExecutions: { current: 450, limit: 2000, percent: 22.5 },
  },
  plan: { name: 'Starter' },
  recentExecutions: [
    {
      _id: 'exec_88301',
      workflowId: { name: 'Inbound Lead Qualification & AI Outreach', _id: 'wf_1' },
      triggerType: 'webhook',
      status: 'completed',
      durationMs: 342,
      aiUsage: { totalTokens: 1420 },
      createdAt: '2026-08-25T11:45:00.000Z',
    },
    {
      _id: 'exec_88302',
      workflowId: { name: 'Customer Support Ticket Semantic Router', _id: 'wf_2' },
      triggerType: 'webhook',
      status: 'completed',
      durationMs: 612,
      aiUsage: { totalTokens: 2840 },
      createdAt: '2026-08-25T11:30:00.000Z',
    },
    {
      _id: 'exec_88303',
      workflowId: { name: 'PDF Invoice Data Extraction & Accounting Sync', _id: 'wf_3' },
      triggerType: 'manual',
      status: 'waiting_approval',
      durationMs: 890,
      aiUsage: { totalTokens: 4120 },
      createdAt: '2026-08-25T11:15:00.000Z',
    },
    {
      _id: 'exec_88304',
      workflowId: { name: 'Nightly Vector KB Sync & Embeddings Refresher', _id: 'wf_4' },
      triggerType: 'schedule',
      status: 'completed',
      durationMs: 1240,
      aiUsage: { totalTokens: 8950 },
      createdAt: '2026-08-25T10:00:00.000Z',
    },
  ],
};

export default function AnalyticsDashboardPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [data, setData] = useState<any>(fallbackAnalytics);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/analytics/dashboard');
      const resData = res.data?.data || res.data;
      if (resData && resData.business) {
        setData(resData);
      }
    } catch {
      setData(fallbackAnalytics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [orgSlug]);

  const { business, ai, quotas, plan, recentExecutions } = data || fallbackAnalytics;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Telemetry & Resource Quotas
            </h1>
            <Badge variant="default" className="text-[10px] font-mono">
              Real-time Metrics
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time insights across workflow execution volume, AI token consumption, plan quotas, and system health.
          </p>
        </div>

        <Link href={`/${orgSlug}/${wsSlug}/settings/billing`}>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8.5">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Manage Subscription</span>
          </Button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Executions</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 font-mono">
              {business.totalExecutions}
            </span>
            <p className="text-[11px] text-neutral-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{business.successRate}% Success Rate</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Active Workflows</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 font-mono">
              {business.activeWorkflows} / {business.totalWorkflows}
            </span>
            <p className="text-[11px] text-neutral-400 mt-1">Live DAG Automations</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">AI Tokens Consumed</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 font-mono">
              {ai.aiTotalTokens.toLocaleString()}
            </span>
            <p className="text-[11px] text-neutral-600 font-semibold mt-1">
              {ai.aiExecutions} AI Operations Run
            </p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Estimated AI Spend</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neutral-900 font-mono">
              ${ai.estimatedCostUsd.toFixed(4)}
            </span>
            <p className="text-[11px] text-neutral-400 mt-1">Active Billing Period</p>
          </div>
        </Card>
      </div>

      {/* Quota Limits & Utilization */}
      <Card className="border-neutral-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span>Subscription Quota Utilization</span>
              <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                {plan?.name || 'Starter'} Plan
              </Badge>
            </h3>
            <p className="text-xs text-neutral-500">Current resource usage against plan limits</p>
          </div>
          <Link href={`/${orgSlug}/${wsSlug}/settings/billing`}>
            <Button size="sm" variant="outline" className="text-xs gap-1">
              <span>Manage Plan</span>
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Workflows Quota */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-700">Total Workflows</span>
              <span className="text-neutral-500 font-mono">
                {quotas.workflows.current} / {quotas.workflows.limit === -1 ? '∞' : quotas.workflows.limit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotas.workflows.percent)}%` }}
              />
            </div>
          </div>

          {/* Monthly Executions */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-700">Monthly Executions</span>
              <span className="text-neutral-500 font-mono">
                {quotas.monthlyExecutions.current} / {quotas.monthlyExecutions.limit === -1 ? '∞' : quotas.monthlyExecutions.limit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotas.monthlyExecutions.percent)}%` }}
              />
            </div>
          </div>

          {/* Monthly AI Executions */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-700">Monthly AI Runs</span>
              <span className="text-neutral-500 font-mono">
                {quotas.monthlyAiExecutions.current} / {quotas.monthlyAiExecutions.limit === -1 ? '∞' : quotas.monthlyAiExecutions.limit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotas.monthlyAiExecutions.percent)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Executions Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
          Recent Workflow Execution Activity
        </h3>

        <Card className="border-neutral-200">
          <CardContent className="p-0">
            {recentExecutions?.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">No executions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 font-medium bg-neutral-50">
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5">Workflow</th>
                      <th className="py-3 px-5">Trigger</th>
                      <th className="py-3 px-5">Duration</th>
                      <th className="py-3 px-5">AI Tokens</th>
                      <th className="py-3 px-5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {recentExecutions?.map((exec: any) => (
                      <tr key={exec._id} className="hover:bg-neutral-50">
                        <td className="py-3 px-5">
                          <Badge
                            variant={
                              exec.status === 'completed'
                                ? 'success'
                                : exec.status === 'running'
                                ? 'outline'
                                : exec.status === 'waiting_approval'
                                ? 'warning'
                                : 'destructive'
                            }
                            className="text-[9px] uppercase font-mono"
                            dot
                          >
                            {exec.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 font-semibold text-neutral-900">
                          <Link href={`/${orgSlug}/${wsSlug}/executions/${exec._id}`} className="hover:underline">
                            {exec.workflowId?.name || 'Automated Workflow'}
                          </Link>
                        </td>
                        <td className="py-3 px-5 font-mono text-neutral-500 capitalize">{exec.triggerType}</td>
                        <td className="py-3 px-5 font-mono text-neutral-600">{exec.durationMs || 0}ms</td>
                        <td className="py-3 px-5 font-mono text-neutral-700">{exec.aiUsage?.totalTokens || 0}</td>
                        <td suppressHydrationWarning className="py-3 px-5 text-neutral-400 text-[11px] font-mono">
                          {new Date(exec.createdAt).toLocaleString()}
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
    </div>
  );
}
