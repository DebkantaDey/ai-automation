'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CreditCard,
  Check,
  Zap,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { Badge } from '../../../../../../components/ui/badge';
import { apiClient } from '../../../../../../lib/api-client';

export default function BillingSettingsPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;

  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, invRes, payRes] = await Promise.all([
        apiClient.get('/billing/subscription'),
        apiClient.get('/billing/plans'),
        apiClient.get('/billing/invoices').catch(() => ({ data: [] })),
        apiClient.get('/billing/payments').catch(() => ({ data: [] })),
      ]);

      setSubData(subRes.data?.data || subRes.data);
      setPlans(plansRes.data?.data || plansRes.data || []);
      setInvoices(invRes.data?.data || invRes.data || []);
      setPayments(payRes.data?.data || payRes.data || []);
    } catch (err: any) {
      setError('Failed to load subscription and billing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [orgSlug]);

  const handlePlanChange = async (planSlug: string) => {
    setProcessingPlan(planSlug);
    setError('');
    setSuccess('');

    try {
      const res = await apiClient.post('/billing/change-plan', {
        planSlug,
        billingInterval,
      });

      setSuccess(`Successfully switched to ${planSlug.toUpperCase()} plan!`);
      await loadBillingData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change plan');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? Your access will remain active until the end of the current billing cycle.',
      )
    ) {
      return;
    }

    try {
      await apiClient.post('/billing/cancel');
      setSuccess('Subscription scheduled for cancellation at the end of the billing period');
      await loadBillingData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await apiClient.post('/billing/reactivate');
      setSuccess('Subscription successfully reactivated!');
      await loadBillingData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reactivate subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs text-neutral-500 animate-pulse">Loading billing, quotas, and invoices...</p>
      </div>
    );
  }

  const currentPlan = subData?.subscription?.plan;
  const subscription = subData?.subscription;
  const usage = subData?.usage;
  const statusDetails = subData?.statusDetails;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <div className="flex items-center gap-2.5">
          <CreditCard className="h-5 w-5 text-neutral-800" />
          <h1 className="text-xl font-bold text-neutral-900">Subscription & Billing</h1>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your organization plan, resource limits, payment methods, and invoice history.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Cancellation Notice Banner */}
      {subscription?.cancelAtPeriodEnd && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Subscription Cancellation Scheduled
              </p>
              <p suppressHydrationWarning className="text-[11px] text-amber-700">
                Your plan will remain active until{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}, after which your organization will revert to the Free tier.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleReactivateSubscription}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs"
          >
            Reactivate Plan
          </Button>
        </div>
      )}

      {/* Current Plan Overview */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-none">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span>{currentPlan?.name || 'Free'} Plan</span>
                  <Badge variant="success" className="capitalize text-[10px] font-mono">
                    {statusDetails?.state?.replace('_', ' ') || subscription?.status || 'Active'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  {currentPlan?.description || 'Essential business automation'}
                </CardDescription>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold text-neutral-900">
                ${subscription?.billingInterval === 'yearly' ? Math.round((currentPlan?.yearlyPrice || 0) / 12) : currentPlan?.monthlyPrice || 0}
              </span>
              <span className="text-xs text-neutral-500"> / month</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Billing Interval: <strong className="text-neutral-900 capitalize">{subscription?.billingInterval || 'Monthly'}</strong>
            </span>
            <span suppressHydrationWarning>
              Renewal / End Date: <strong className="text-neutral-900">{subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</strong>
            </span>
          </div>

          {/* Resource Usage Progress Bars */}
          <div className="space-y-3 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Resource Usage Quotas
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team Members */}
              <div className="space-y-1 rounded-lg border border-neutral-100 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">Team Members</span>
                  <span className="font-semibold text-neutral-900">
                    {usage?.users?.current} / {usage?.users?.limit === -1 ? 'Unlimited' : usage?.users?.limit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${usage?.users?.percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Workspaces */}
              <div className="space-y-1 rounded-lg border border-neutral-100 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">Workspaces</span>
                  <span className="font-semibold text-neutral-900">
                    {usage?.workspaces?.current} / {usage?.workspaces?.limit === -1 ? 'Unlimited' : usage?.workspaces?.limit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${usage?.workspaces?.percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Monthly Workflow Executions */}
              <div className="space-y-1 rounded-lg border border-neutral-100 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">Monthly Executions</span>
                  <span className="font-semibold text-neutral-900">
                    {usage?.executions?.current} / {usage?.executions?.limit === -1 ? 'Unlimited' : usage?.executions?.limit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${usage?.executions?.percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* AI Token Quota */}
              <div className="space-y-1 rounded-lg border border-neutral-100 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">AI Tokens</span>
                  <span className="font-semibold text-neutral-900">
                    {usage?.aiTokens?.current} / {usage?.aiTokens?.limit === -1 ? 'Unlimited' : usage?.aiTokens?.limit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${usage?.aiTokens?.percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans Switcher Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Available Plans</h2>
            <p className="text-xs text-neutral-500">Upgrade or switch plans as your automation needs evolve.</p>
          </div>

          {/* Interval Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                billingInterval === 'monthly'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-3 py-1 text-xs rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                billingInterval === 'yearly'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span>Yearly</span>
              <Badge variant="default" className="text-[9px] px-1 py-0 font-mono">
                -20%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = (currentPlan?.slug || 'free') === plan.slug;
            const price =
              billingInterval === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

            return (
              <Card
                key={plan.slug}
                className={`relative flex flex-col justify-between border ${
                  isCurrent
                    ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm'
                    : 'border-neutral-200'
                }`}
              >
                {plan.isPopular && !isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      Popular
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-neutral-900">
                      {plan.name}
                    </CardTitle>
                    {isCurrent && (
                      <Badge variant="default" className="text-[9px]">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-neutral-900">
                      ${price}
                    </span>
                    <span className="text-xs text-neutral-500">/ mo</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs flex-1">
                  <div className="space-y-1.5 text-[11px] text-neutral-600">
                    <div>• {plan.limits?.maxUsers === -1 ? 'Unlimited' : plan.limits?.maxUsers} Users</div>
                    <div>• {plan.limits?.maxWorkspaces === -1 ? 'Unlimited' : plan.limits?.maxWorkspaces} Workspaces</div>
                    <div>• {plan.limits?.maxWorkflows === -1 ? 'Unlimited' : plan.limits?.maxWorkflows} Workflows</div>
                    <div>• {plan.limits?.maxWorkflowExecutions === -1 ? 'Unlimited' : plan.limits?.maxWorkflowExecutions?.toLocaleString()} Executions / mo</div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-neutral-100">
                  <Button
                    size="sm"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={isCurrent || processingPlan === plan.slug}
                    onClick={() => handlePlanChange(plan.slug)}
                    className={`w-full text-xs ${
                      !isCurrent ? 'bg-neutral-900 hover:bg-neutral-800 text-white' : ''
                    }`}
                  >
                    {processingPlan === plan.slug
                      ? 'Switching...'
                      : isCurrent
                      ? 'Active Plan'
                      : `Switch to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invoice History & Payment Transactions */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-700" />
            <CardTitle className="text-sm font-bold text-neutral-900">
              Invoices & Payment History
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Review past billing invoices, transaction amounts, and download receipts.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {invoices.length === 0 && payments.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-400">
              <FileText className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
              <p>No billing invoices or payment records found yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-medium">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Invoice / ID</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Provider</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {invoices.map((inv) => (
                    <tr key={inv._id || inv.providerInvoiceId} className="hover:bg-neutral-50">
                      <td suppressHydrationWarning className="py-3 text-neutral-600">
                        {new Date(inv.issueDate || inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-mono font-medium text-neutral-900">
                        {inv.invoiceNumber || inv.providerInvoiceId}
                      </td>
                      <td className="py-3 font-semibold text-neutral-900">
                        ${inv.amount} {inv.currency}
                      </td>
                      <td className="py-3 capitalize text-neutral-500">
                        {inv.provider}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={inv.status === 'paid' ? 'success' : inv.status === 'failed' ? 'destructive' : 'outline'}
                          className="capitalize text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {inv.invoiceUrl || inv.invoicePdf ? (
                          <a
                            href={inv.invoiceUrl || inv.invoicePdf}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-neutral-900 hover:underline text-xs font-medium"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">—</span>
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

      {/* Danger Zone: Cancellation */}
      {!subscription?.cancelAtPeriodEnd && currentPlan?.slug !== 'free' && (
        <Card className="border-neutral-200 bg-neutral-50/50">
          <CardHeader className="pb-3 border-b border-neutral-200">
            <CardTitle className="text-sm font-semibold text-neutral-900">
              Subscription Management
            </CardTitle>
            <CardDescription className="text-xs">
              Cancel your paid subscription plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-900">
                Cancel Subscription
              </p>
              <p className="text-[11px] text-neutral-500">
                Your subscription will remain active until the end of your billing cycle.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelSubscription}
              className="text-xs border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            >
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
