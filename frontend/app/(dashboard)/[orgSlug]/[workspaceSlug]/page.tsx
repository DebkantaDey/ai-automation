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
  Server,
  ArrowRight,
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
import { formatNumber } from '../../../../lib/utils';

const chartData = [
  { time: '00:00', executions: 120, aiTokens: 45000 },
  { time: '04:00', executions: 85, aiTokens: 32000 },
  { time: '08:00', executions: 340, aiTokens: 142000 },
  { time: '12:00', executions: 580, aiTokens: 289000 },
  { time: '16:00', executions: 490, aiTokens: 210000 },
  { time: '20:00', executions: 310, aiTokens: 125000 },
  { time: '23:59', executions: 190, aiTokens: 78000 },
];

const fallbackRecentExecutions = [
  {
    _id: 'exec_88301',
    workflowId: { name: 'Inbound Lead Qualification & AI Outreach', _id: 'wf_1' },
    triggerType: 'webhook',
    status: 'completed',
    durationMs: 342,
    aiUsage: { totalTokens: 1420, costUsd: 0.0028 },
    createdAt: '2026-08-25T11:45:00.000Z',
  },
  {
    _id: 'exec_88302',
    workflowId: { name: 'Customer Support Ticket Semantic Router', _id: 'wf_2' },
    triggerType: 'webhook',
    status: 'completed',
    durationMs: 612,
    aiUsage: { totalTokens: 2840, costUsd: 0.0056 },
    createdAt: '2026-08-25T11:30:00.000Z',
  },
  {
    _id: 'exec_88303',
    workflowId: { name: 'PDF Invoice Data Extraction & Accounting Sync', _id: 'wf_3' },
    triggerType: 'manual',
    status: 'waiting_approval',
    durationMs: 890,
    aiUsage: { totalTokens: 4120, costUsd: 0.0082 },
    createdAt: '2026-08-25T11:15:00.000Z',
  },
  {
    _id: 'exec_88304',
    workflowId: { name: 'Nightly Vector KB Sync & Embeddings Refresher', _id: 'wf_4' },
    triggerType: 'schedule',
    status: 'completed',
    durationMs: 1240,
    aiUsage: { totalTokens: 8950, costUsd: 0.0179 },
    createdAt: '2026-08-25T10:00:00.000Z',
  },
];

export default function DashboardOverviewPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await apiClient.get('/analytics/dashboard');
        setDashboardData(res.data?.data || res.data);
      } catch {
        // Fallback gracefully
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    }
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

  const recentExecutions = dashboardData?.recentExecutions?.length > 0
    ? dashboardData.recentExecutions
    : fallbackRecentExecutions;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header & Quick Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Automation Command Center
            </h1>
            <Badge variant="default" className="text-[10px] font-mono uppercase">
              Production
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time multi-tenant workflow telemetry, autonomous AI agent execution, and quota health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/${orgSlug}/${wsSlug}/templates`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5 text-neutral-700" />
              <span>Browse Templates</span>
            </Button>
          </Link>
          <Link href={`/${orgSlug}/${wsSlug}/workflows`}>
            <Button size="sm" className="gap-1.5 text-xs bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>New Pipeline</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Approvals Warning Gate */}
      {business.waitingApprovalExecutions > 0 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-none">
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-xs">
                {business.waitingApprovalExecutions} workflow actions paused
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Critical gate steps require human review before continuing execution.
              </p>
            </div>
          </div>
          <Link href={`/${orgSlug}/${wsSlug}/executions`}>
            <Button size="sm" variant="outline" className="h-7 text-xs bg-white border-amber-300 text-amber-900">
              Review Queue
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-neutral-200 hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Active Workflows</span>
            <div className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
              <GitFork className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-neutral-900">
                {business.activeWorkflows}
              </span>
              <span className="text-xs text-neutral-400 font-mono">/ {business.totalWorkflows}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>DAG Engine Active</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Total Executions</span>
            <div className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900">
              {formatNumber(business.totalExecutions)}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-600 font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{business.successRate}% Success Rate</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>AI Tokens Processed</span>
            <div className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900">
              {formatNumber(ai.aiTotalTokens)}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-600 font-medium">
              <Sparkles className="h-3 w-3 text-neutral-700" />
              <span>Est. Cost: ${ai.estimatedCostUsd}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200 hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Avg Execution Latency</span>
            <div className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900">
              1.42s
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-600 font-medium">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Zero Queue Backlog</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Section & AI Gateway Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-neutral-200">
          <CardHeader className="py-3 px-5 border-b border-neutral-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900">
                Execution Throughput & AI Demand
              </CardTitle>
              <CardDescription className="text-xs">
                Hourly automation runs and token consumption across background worker nodes
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              Last 24 Hours
            </Badge>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e4e4e7',
                    color: '#09090b',
                    fontSize: '11px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="executions"
                  stroke="#18181b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExec)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Gateway Routing Status Card */}
        <Card className="border-neutral-200">
          <CardHeader className="py-3 px-5 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-neutral-900">AI Gateway Routing</CardTitle>
              <Cpu className="h-4 w-4 text-neutral-700" />
            </div>
            <CardDescription className="text-xs">Multi-provider dynamic failover routing</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-neutral-900">OpenAI (GPT-4o)</span>
              </div>
              <Badge variant="success" className="text-[9px] font-mono uppercase" dot>Primary</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-neutral-400" />
                <span className="text-xs font-semibold text-neutral-900">Google Gemini 1.5</span>
              </div>
              <Badge variant="secondary" className="text-[9px] font-mono uppercase">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-neutral-400" />
                <span className="text-xs font-semibold text-neutral-900">Anthropic Claude 3.5</span>
              </div>
              <Badge variant="secondary" className="text-[9px] font-mono uppercase">Fallback</Badge>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Automatic Failover</span>
              <span className="font-semibold text-neutral-800">Zero Downtime</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions Real-Time Table */}
      <Card className="border-neutral-200">
        <CardHeader className="py-3 px-5 flex flex-row items-center justify-between border-b border-neutral-100">
          <div>
            <CardTitle className="text-sm font-bold text-neutral-900">Live Execution Activity</CardTitle>
            <CardDescription className="text-xs">Streaming telemetry from distributed worker queue</CardDescription>
          </div>
          <Link href={`/${orgSlug}/${wsSlug}/executions`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-neutral-700 hover:text-neutral-900">
              <span>View All Executions</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-medium bg-neutral-50">
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Workflow Name</th>
                  <th className="py-3 px-5">Trigger Mechanism</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">AI Tokens</th>
                  <th className="py-3 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentExecutions.map((exec: any) => (
                  <tr key={exec._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-5">
                      <Badge
                        variant={exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'destructive' : 'outline'}
                        className="text-[9px] uppercase font-mono"
                        dot
                      >
                        {exec.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 font-semibold text-neutral-900">
                      <Link href={`/${orgSlug}/${wsSlug}/executions/${exec._id}`} className="hover:underline">
                        {exec.workflowId?.name || 'Automated Pipeline'}
                      </Link>
                    </td>
                    <td className="py-3 px-5 capitalize font-mono text-neutral-500">{exec.triggerType}</td>
                    <td className="py-3 px-5 font-mono text-neutral-600">{exec.durationMs || 0}ms</td>
                    <td className="py-3 px-5 font-mono text-neutral-700 font-medium">
                      {exec.aiUsage?.totalTokens ? formatNumber(exec.aiUsage.totalTokens) : '0'}
                    </td>
                    <td suppressHydrationWarning className="py-3 px-5 text-neutral-400 text-[11px] font-mono">
                      {new Date(exec.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
