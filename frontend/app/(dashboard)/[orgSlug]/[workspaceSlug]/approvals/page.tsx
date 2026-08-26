'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileCheck,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  DollarSign,
  User,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';

const fallbackApprovals = [
  {
    id: 'appr-101',
    actionType: 'issue_refund',
    title: 'Refund Request: ₹50,000 for Customer #CUST-992',
    requestedBy: 'AI Support Desk Agent',
    reason: 'Customer initiated return within 7-day money back SLA window due to branch relocation.',
    payload: { amount: '₹50,000', customerId: 'CUST-992', paymentId: 'pay_stripe_88410' },
    status: 'pending',
    createdAt: '2026-08-25T11:40:00.000Z',
  },
  {
    id: 'appr-102',
    actionType: 'send_mass_whatsapp',
    title: 'Mass WhatsApp Campaign: 2,400 Inactive Leads Re-engagement',
    requestedBy: 'AI Marketing Agent',
    reason: 'Promotional blast offering 20% discount on annual upgrade.',
    payload: { recipientsCount: 2400, templateId: 'tpl_annual_discount_2026' },
    status: 'pending',
    createdAt: '2026-08-25T10:15:00.000Z',
  },
];

export default function HumanApprovalGatePage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [approvals, setApprovals] = useState(fallbackApprovals);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApprove = (id: string) => {
    setActingId(id);
    setTimeout(() => {
      setApprovals(approvals.filter((a) => a.id !== id));
      setMessage({ type: 'success', text: 'Action approved and DAG workflow execution resumed!' });
      setActingId(null);
      setTimeout(() => setMessage(null), 3000);
    }, 400);
  };

  const handleReject = (id: string) => {
    setActingId(id);
    setTimeout(() => {
      setApprovals(approvals.filter((a) => a.id !== id));
      setMessage({ type: 'error', text: 'Action rejected. Workflow terminated gracefully.' });
      setActingId(null);
      setTimeout(() => setMessage(null), 3000);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Human-in-the-Loop Approval Gate
            </h1>
            <Badge variant="warning" className="text-[10px] font-mono">
              Zero-Risk AI Safety
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Sensitive AI actions (refunds, deletions, pricing modifications, and mass campaigns) paused pending human manager authorization.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>RBAC Policy: Manager / Admin Signed</span>
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
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Approval Requests */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
          Pending Authorizations ({approvals.length})
        </h2>

        {approvals.length === 0 ? (
          <Card className="p-12 text-center text-xs text-neutral-500 border-dashed">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p>All sensitive actions have been reviewed. No items in approval queue.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {approvals.map((req) => (
              <Card key={req.id} className="p-5 border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{req.title}</h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-mono flex items-center gap-1 mt-0.5">
                        <Sparkles className="h-3 w-3" />
                        Initiated by: {req.requestedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      isLoading={actingId === req.id}
                      onClick={() => handleApprove(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 font-semibold"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Authorize Action</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === req.id}
                      onClick={() => handleReject(req.id)}
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 gap-1 font-semibold"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                  <span className="font-semibold text-neutral-900 dark:text-white">AI Context Rationale:</span>
                  <p className="leading-relaxed">{req.reason}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
