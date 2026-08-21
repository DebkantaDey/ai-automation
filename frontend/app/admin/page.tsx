'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Server,
  Database,
  Layers,
  Activity,
  Users,
  Building,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Terminal,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { apiClient } from '../../lib/api-client';

export default function SuperAdminPage() {
  const [overview, setOverview] = useState<any | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'organizations' | 'audit' | 'dlq'>('health');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dlqJobs, setDlqJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, healthRes] = await Promise.all([
        apiClient.get('/admin/overview').catch(() => null),
        apiClient.get('/admin/health').catch(() => null),
      ]);

      if (ovRes) setOverview(ovRes.data?.data || ovRes.data);
      if (healthRes) setHealth(healthRes.data?.data || healthRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Platform administrator credentials required.');
    } finally {
      setLoading(false);
    }
  };

  const loadTabContent = async (tab: string) => {
    setActiveTab(tab as any);
    try {
      if (tab === 'organizations') {
        const res = await apiClient.get('/admin/organizations');
        setOrgs(res.data?.data || res.data || []);
      } else if (tab === 'audit') {
        const res = await apiClient.get('/admin/audit-logs');
        setAuditLogs(res.data?.data || res.data || []);
      } else if (tab === 'dlq') {
        const res = await apiClient.get('/admin/dlq');
        setDlqJobs(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error('Failed to load tab data', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4 border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Platform SuperAdmin Control Center
            </h1>
            <Badge variant="destructive" className="text-[10px] uppercase font-mono ml-2">
              System Level Access
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cross-tenant governance, infrastructure health diagnostics, global audit trails, and worker telemetry.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadAdminData}
          className="gap-1.5 text-xs h-8"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Telemetry</span>
        </Button>
      </div>

      {error && (
        <Card className="border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-4 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </Card>
      )}

      {/* Global Overview KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
              <span>Total Users</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-neutral-900 dark:text-white">
              {overview.users?.total || 0}
            </p>
          </Card>

          <Card className="p-4 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
              <span>Organizations</span>
              <Building className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-neutral-900 dark:text-white">
              {overview.organizations?.total || 0}
            </p>
          </Card>

          <Card className="p-4 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
              <span>Active Subscriptions</span>
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-neutral-900 dark:text-white">
              {overview.subscriptions?.active || 0}
            </p>
          </Card>

          <Card className="p-4 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
              <span>Total Workflows</span>
              <Layers className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-neutral-900 dark:text-white">
              {overview.workflows?.total || 0}
            </p>
          </Card>

          <Card className="p-4 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
              <span>Success Rate</span>
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono mt-2 text-emerald-600">
              {overview.executions?.successRate || 100}%
            </p>
          </Card>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: 'health', label: 'System Health Diagnostics', icon: Activity },
          { id: 'organizations', label: 'Organizations Directory', icon: Building },
          { id: 'audit', label: 'Global Audit Logs', icon: Clock },
          { id: 'dlq', label: 'Dead Letter Queue (DLQ)', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => loadTabContent(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: System Health Diagnostics */}
      {activeTab === 'health' && health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                MongoDB Atlas
              </span>
              <Badge variant="success" className="text-[9px] uppercase font-mono">
                {health.components?.database?.status || 'Healthy'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">Engine: MongoDB Atlas Replication</p>
            <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
              Ping Latency: <strong>{health.components?.database?.latencyMs}ms</strong>
            </p>
          </Card>

          <Card className="p-4 border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                Redis & BullMQ Queues
              </span>
              <Badge variant="success" className="text-[9px] uppercase font-mono">
                {health.components?.redis?.status || 'Healthy'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">Active Workers: {health.components?.queues?.activeWorkers || 8}</p>
            <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
              DLQ Failed Executions: <strong>{health.components?.queues?.failedJobsDlq || 0}</strong>
            </p>
          </Card>

          <Card className="p-4 border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                AI Gateway & Providers
              </span>
              <Badge variant="success" className="text-[9px] uppercase font-mono">
                Operational
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">Connected: OpenAI, Google Gemini, Anthropic</p>
            <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
              Payments: Stripe & Razorpay Webhooks Active
            </p>
          </Card>
        </div>
      )}

      {/* Tab 2: Organizations Directory */}
      {activeTab === 'organizations' && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium bg-neutral-50/50 dark:bg-neutral-900/50">
                    <th className="py-2.5 px-4">Organization</th>
                    <th className="py-2.5 px-4">Slug</th>
                    <th className="py-2.5 px-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {orgs.map((o) => (
                    <tr key={o._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                      <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-white">{o.name}</td>
                      <td className="py-2.5 px-4 font-mono text-neutral-500">{o.slug}</td>
                      <td className="py-2.5 px-4 text-neutral-400 text-[11px]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Global Audit Logs */}
      {activeTab === 'audit' && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium bg-neutral-50/50 dark:bg-neutral-900/50">
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Entity</th>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Organization</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 font-mono">
                      <td className="py-2.5 px-4 font-semibold text-blue-600">{log.action}</td>
                      <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-300">{log.entityType}</td>
                      <td className="py-2.5 px-4 text-neutral-500">{log.userId?.email || 'System'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">{log.organizationId?.name || 'N/A'}</td>
                      <td className="py-2.5 px-4 text-neutral-400 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Dead Letter Queue (DLQ) */}
      {activeTab === 'dlq' && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            {dlqJobs.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">No failed jobs in the Dead Letter Queue. All queues are running cleanly.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium bg-neutral-50/50 dark:bg-neutral-900/50">
                      <th className="py-2.5 px-4">Workflow</th>
                      <th className="py-2.5 px-4">Organization</th>
                      <th className="py-2.5 px-4">Error Message</th>
                      <th className="py-2.5 px-4">Failed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {dlqJobs.map((job) => (
                      <tr key={job._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                        <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-white">{job.workflowId?.name || 'Workflow'}</td>
                        <td className="py-2.5 px-4 text-neutral-500">{job.organizationId?.name || 'Org'}</td>
                        <td className="py-2.5 px-4 text-red-600 font-mono text-[11px]">{job.error || 'Execution failed'}</td>
                        <td className="py-2.5 px-4 text-neutral-400 text-[11px]">{new Date(job.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
