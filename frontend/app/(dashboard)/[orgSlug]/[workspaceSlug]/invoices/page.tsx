'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CreditCard,
  Plus,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Send,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';

const fallbackInvoices = [
  {
    id: 'INV-2026-001',
    customerName: 'Global Logistics Corp',
    amount: 4800,
    currency: 'USD',
    status: 'paid',
    dueDate: '2026-08-20',
    issuedDate: '2026-08-01',
    provider: 'Stripe',
  },
  {
    id: 'INV-2026-002',
    customerName: 'HealthTech Clinics',
    amount: 2400,
    currency: 'USD',
    status: 'pending',
    dueDate: '2026-08-30',
    issuedDate: '2026-08-15',
    provider: 'Razorpay',
  },
  {
    id: 'INV-2026-003',
    customerName: 'Nexus FinServe',
    amount: 7200,
    currency: 'USD',
    status: 'overdue',
    dueDate: '2026-08-18',
    issuedDate: '2026-08-04',
    provider: 'Stripe',
  },
];

export default function InvoicesPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [invoices, setInvoices] = useState(fallbackInvoices);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Invoices & Billing Ledger
            </h1>
            <Badge variant="default" className="text-[10px] font-mono">
              Stripe & Razorpay
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Create invoices, track customer payment statuses, and trigger automated WhatsApp payment reminder sequences.
          </p>
        </div>

        <Button size="sm" className="text-xs gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
          <Plus className="h-3.5 w-3.5" />
          <span>Create Invoice</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Collected Revenue</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900">$14,400</span>
            <p className="text-[11px] text-neutral-600 font-semibold mt-1">Settled to bank account</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Pending Receivables</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900">$2,400</span>
            <p className="text-[11px] text-neutral-400 mt-1">Due in 5 days</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Overdue Amount</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900">$7,200</span>
            <p className="text-[11px] text-neutral-600 font-semibold mt-1">Automated reminder enqueued</p>
          </div>
        </Card>
      </div>

      {/* Invoice Ledger Table */}
      <Card className="border-neutral-200">
        <CardHeader className="py-3 px-5 border-b border-neutral-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-neutral-900">
            Customer Invoices ({filteredInvoices.length})
          </CardTitle>
          <div className="w-64">
            <Input
              placeholder="Search invoice number, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-medium bg-neutral-50">
                  <th className="py-3 px-5">Invoice #</th>
                  <th className="py-3 px-5">Customer / Client</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Due Date</th>
                  <th className="py-3 px-5">Gateway</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-5 font-mono font-semibold text-neutral-900">
                      {inv.id}
                    </td>
                    <td className="py-3 px-5 font-medium text-neutral-800">
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-neutral-900">
                      ${inv.amount.toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3 px-5">
                      <Badge
                        variant={
                          inv.status === 'paid'
                            ? 'success'
                            : inv.status === 'pending'
                            ? 'outline'
                            : 'destructive'
                        }
                        className="text-[9px] uppercase font-mono"
                        dot
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td suppressHydrationWarning className="py-3 px-5 text-neutral-500 font-mono text-[11px]">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-5 font-mono text-neutral-400 text-[11px]">{inv.provider}</td>
                    <td className="py-3 px-5 text-right">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-neutral-700 hover:text-neutral-900">
                        <Download className="h-3 w-3 mr-1" />
                        <span>PDF</span>
                      </Button>
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
