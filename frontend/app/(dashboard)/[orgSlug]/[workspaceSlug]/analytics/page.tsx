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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { apiClient } from '../../../../../lib/api-client';

export default function AnalyticsDashboardPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/analytics/dashboard');
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load analytics dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [orgSlug]);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-xs text-neutral-500 animate-pulse">Aggregating platform execution analytics & AI metrics...</p>
      </div>
    );
  }

  const { business, ai, quotas, plan, recentExecutions } = data;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Analytics & Operations Dashboard
          </h1>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Real-time insights across workflow execution volume, AI token consumption, plan quotas, and system health.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Executions</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
              {business.totalExecutions}
            </span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {business.successRate}% Success Rate
            </p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Active Workflows</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
              {business.activeWorkflows} / {business.totalWorkflows}
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Live Published Automations</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">AI Tokens Consumed</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
              {ai.aiTotalTokens.toLocaleString()}
            </span>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              {ai.aiExecutions} AI Operations Run
            </p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Estimated AI Spend</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
              ${ai.estimatedCostUsd.toFixed(4)}
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Active Billing Period</p>
          </div>
        </Card>
      </div>

      {/* Quota Limits & Utilization */}
      <Card className="border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
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
              <span className="text-neutral-700 dark:text-neutral-300">Total Workflows</span>
              <span className="text-neutral-500 font-mono">
                {quotas.workflows.current} / {quotas.workflows.limit === -1 ? '∞' : quotas.workflows.limit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotas.workflows.percent)}%` }}
              />
            </div>
          </div>

          {/* Monthly Executions */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-700 dark:text-neutral-300">Monthly Executions</span>
              <span className="text-neutral-500 font-mono">
                {quotas.monthlyExecutions.current} / {quotas.monthlyExecutions.limit === -1 ? '∞' : quotas.monthlyExecutions.limit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotas.monthlyExecutions.percent)}%` }}
              />
            </div>
          </div>

          {/* Monthly AI Executions */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-700 dark:text-neutral-300">Monthly AI Runs</span>
              <span className="text-neutral-500 font-mono">
                {quotas.monthlyAiExecutions.current} / {quotas.monthlyAiExecutions.limit === -1 ? '∞' : quotas.monthlyAiExecutions.limit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotas.monthlyAiExecutions.percent)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Executions Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Recent Workflow Execution Activity
        </h3>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            {recentExecutions?.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">No executions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium bg-neutral-50/50 dark:bg-neutral-900/50">
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Workflow</th>
                      <th className="py-2.5 px-4">Trigger</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4">AI Tokens</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {recentExecutions?.map((exec: any) => (
                      <tr key={exec._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                        <td className="py-2.5 px-4">
                          <Badge
                            variant={
                              exec.status === 'completed'
                                ? 'success'
                                : exec.status === 'running'
                                ? 'outline'
                                : exec.status === 'waiting_approval'
                                ? 'outline'
                                : 'destructive'
                            }
                            className="text-[9px] uppercase font-mono"
                          >
                            {exec.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-white">
                          <Link href={`/${orgSlug}/${wsSlug}/executions/${exec._id}`} className="hover:underline text-blue-600">
                            {exec.workflowId?.name || 'Automated Workflow'}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-neutral-500 capitalize">{exec.triggerType}</td>
                        <td className="py-2.5 px-4 font-mono text-neutral-500">{exec.durationMs || 0}ms</td>
                        <td className="py-2.5 px-4 font-mono text-purple-600">{exec.aiUsage?.totalTokens || 0}</td>
                        <td className="py-2.5 px-4 text-neutral-400 text-[11px]">
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
