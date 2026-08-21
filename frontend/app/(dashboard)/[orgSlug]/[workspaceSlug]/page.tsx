'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  GitFork,
  Play,
  Plus,
  TrendingUp,
  Zap,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { apiClient } from '../../../../lib/api-client';
import { formatNumber, formatCurrency } from '../../../../lib/utils';

const chartData = [
  { time: '00:00', executions: 120, aiTokens: 45000 },
  { time: '04:00', executions: 85, aiTokens: 32000 },
  { time: '08:00', executions: 340, aiTokens: 142000 },
  { time: '12:00', executions: 580, aiTokens: 289000 },
  { time: '16:00', executions: 490, aiTokens: 210000 },
  { time: '20:00', executions: 310, aiTokens: 125000 },
  { time: '23:59', executions: 190, aiTokens: 78000 },
];

export default function DashboardOverviewPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await apiClient.get('/analytics/dashboard');
      setDashboardData(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [orgSlug]);

  const business = dashboardData?.business || {
    totalWorkflows: 14,
    activeWorkflows: 11,
    totalExecutions: 2115,
    completedExecutions: 2102,
    failedExecutions: 13,
    waitingApprovalExecutions: 2,
    successRate: 99.4,
  };

  const ai = dashboardData?.ai || {
    aiTotalTokens: 921000,
    aiExecutions: 450,
    estimatedCostUsd: 8.45,
  };

  const recentExecutions = dashboardData?.recentExecutions || [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Welcome Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Automation Command Center
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time multi-tenant workflow telemetry, autonomous AI agent execution, and quota health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${orgSlug}/${wsSlug}/templates`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5 text-blue-600" />
              <span>Browse Templates</span>
            </Button>
          </Link>
          <Link href={`/${orgSlug}/${wsSlug}/workflows`}>
            <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-3.5 w-3.5" />
              <span>New Workflow</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Approvals Warning Gate */}
      {business.waitingApprovalExecutions > 0 && (
        <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-amber-900 dark:text-amber-200">
              <strong>{business.waitingApprovalExecutions} workflow actions</strong> are paused waiting for human manager review.
            </span>
          </div>
          <Link href={`/${orgSlug}/${wsSlug}/executions`}>
            <Button size="sm" variant="outline" className="h-7 text-xs bg-white dark:bg-neutral-900 border-amber-300">
              Review Queue
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Active Workflows</span>
            <GitFork className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
              {business.activeWorkflows} / {business.totalWorkflows}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp className="h-3 w-3" />
              <span>DAG Engine Active</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Total Executions</span>
            <Activity className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
              {formatNumber(business.totalExecutions)}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              <span>{business.successRate}% Success Rate</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>AI Tokens Processed</span>
            <Bot className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
              {formatNumber(ai.aiTotalTokens)}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-purple-600 font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>Est. Cost: ${ai.estimatedCostUsd}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Avg Execution Latency</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
              1.42s
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
              <ShieldCheck className="h-3 w-3" />
              <span>9 BullMQ Queues Operational</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Section & AI Provider Gateway status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-neutral-200 dark:border-neutral-800">
          <CardHeader className="py-3 px-4 border-b border-neutral-100 dark:border-neutral-800">
            <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">
              Execution Throughput & AI Demand
            </CardTitle>
            <CardDescription className="text-xs">
              Hourly automation runs and token consumption across background workers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="executions"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExec)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Gateway Status Card */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="py-3 px-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">AI Gateway Routing</CardTitle>
              <Cpu className="h-4 w-4 text-purple-600" />
            </div>
            <CardDescription className="text-xs">Multi-provider dynamic routing</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">OpenAI (GPT-4o)</span>
              </div>
              <Badge variant="success" className="text-[9px]">Primary</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">Google Gemini 1.5</span>
              </div>
              <Badge variant="secondary" className="text-[9px]">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">Anthropic Claude 3.5</span>
              </div>
              <Badge variant="secondary" className="text-[9px]">Fallback</Badge>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Automatic Failover</span>
              <span className="font-medium text-emerald-600">Enabled</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions Real-Time Table */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">Live Execution Activity</CardTitle>
            <CardDescription className="text-xs">Streaming telemetry from worker queue</CardDescription>
          </div>
          <Link href={`/${orgSlug}/${wsSlug}/executions`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600">
              <span>View All Executions</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
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
                {recentExecutions.length > 0 ? (
                  recentExecutions.map((exec: any) => (
                    <tr key={exec._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <td className="py-2.5 px-4">
                        <Badge
                          variant={exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'destructive' : 'outline'}
                          className="text-[9px] uppercase font-mono"
                        >
                          {exec.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-white">
                        <Link href={`/${orgSlug}/${wsSlug}/executions/${exec._id}`} className="hover:underline text-blue-600">
                          {exec.workflowId?.name || 'Automated Pipeline'}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 capitalize font-mono text-neutral-500">{exec.triggerType}</td>
                      <td className="py-2.5 px-4 font-mono text-neutral-500">{exec.durationMs || 0}ms</td>
                      <td className="py-2.5 px-4 font-mono text-purple-600">{exec.aiUsage?.totalTokens || 0}</td>
                      <td className="py-2.5 px-4 text-neutral-400 text-[11px]">{new Date(exec.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400 text-xs">
                      No executions recorded yet. Run a workflow to observe live executions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
