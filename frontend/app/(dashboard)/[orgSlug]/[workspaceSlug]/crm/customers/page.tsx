'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Building,
  DollarSign,
  Calendar,
  CreditCard,
  MessageSquare,
  FileText,
  Activity,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';

const fallbackCustomers = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    email: 'sjenkins@globallogistics.com',
    phone: '+1 (555) 234-5678',
    company: 'Global Logistics Corp',
    totalSpend: 58400,
    status: 'active',
    tier: 'Enterprise Tier 1',
    joinedAt: '2026-03-12',
    aiInsights: 'High lifetime value, zero churn risk. Responds to WhatsApp within 8 minutes.',
    recentActivity: [
      { type: 'invoice', title: 'Invoice #INV-2026-088 Paid ($4,800)', date: '2026-08-20' },
      { type: 'message', title: 'WhatsApp query answered by Sales AI Agent', date: '2026-08-18' },
      { type: 'appointment', title: 'Quarterly Business Review with Account Exec', date: '2026-08-10' },
    ],
  },
  {
    id: 'cust-2',
    name: 'Dr. Robert Miller',
    email: 'rmiller@healthclinics.org',
    phone: '+1 (555) 876-5432',
    company: 'HealthTech Clinics',
    totalSpend: 24200,
    status: 'active',
    tier: 'Pro Tier',
    joinedAt: '2026-05-04',
    aiInsights: 'Prefers automated SMS/WhatsApp appointment reminders for dental branches.',
    recentActivity: [
      { type: 'appointment', title: 'Automation onboarding session booked', date: '2026-08-22' },
      { type: 'invoice', title: 'Invoice #INV-2026-074 Paid ($2,400)', date: '2026-08-01' },
    ],
  },
  {
    id: 'cust-3',
    name: 'Michael Chen',
    email: 'mchen@nexusfin.com',
    phone: '+1 (555) 765-4321',
    company: 'Nexus FinServe',
    totalSpend: 84000,
    status: 'active',
    tier: 'Enterprise Custom',
    joinedAt: '2026-01-15',
    aiInsights: 'Requested custom webhook signature encryption and dedicated rate limit limits.',
    recentActivity: [
      { type: 'security', title: 'AES-256 API Key rotated by Admin', date: '2026-08-24' },
      { type: 'invoice', title: 'Invoice #INV-2026-091 Sent ($7,200)', date: '2026-08-15' },
    ],
  },
];

export default function Customers360Page() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';
  const basePath = `/${orgSlug}/${wsSlug}`;

  const [customers, setCustomers] = useState(fallbackCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(fallbackCustomers[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              360° Customer Profiles
            </h1>
            <Badge variant="default" className="text-[10px] font-mono">
              Unified Records
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Complete customer view across conversations, invoice ledger, appointments, tasks, and predictive AI insights.
          </p>
        </div>

        <Button size="sm" className="text-xs gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
          <Plus className="h-3.5 w-3.5" />
          <span>New Customer</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Customer List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <div className="space-y-2">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;

              return (
                <Card
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3.5 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-white shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900">{cust.name}</h3>
                      <p className="text-[11px] text-neutral-500">{cust.company}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-neutral-900">
                        ${cust.totalSpend.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">{cust.tier}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: 360° Customer Profile Detail */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="space-y-4">
              {/* Profile Card Header */}
              <Card className="border-neutral-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        <span>{selectedCustomer.name}</span>
                        <Badge variant="success" className="text-[9px] uppercase font-mono" dot>
                          {selectedCustomer.status}
                        </Badge>
                      </h2>
                      <p className="text-xs text-neutral-500">{selectedCustomer.company} • {selectedCustomer.tier}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-400">Lifetime Revenue</span>
                    <p className="text-lg font-bold font-mono text-neutral-900">
                      ${selectedCustomer.totalSpend.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* AI Insights Banner */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                    <Sparkles className="h-3.5 w-3.5 text-neutral-600" />
                    <span>AI Relationship Insights</span>
                  </div>
                  <p className="text-neutral-700 text-[11px] leading-relaxed">
                    {selectedCustomer.aiInsights}
                  </p>
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-100">
                  <div>
                    <span className="text-neutral-400 text-[11px]">Email Address</span>
                    <p className="font-semibold text-neutral-900 mt-0.5">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px]">Phone / WhatsApp</span>
                    <p className="font-semibold text-neutral-900 mt-0.5">{selectedCustomer.phone}</p>
                  </div>
                </div>
              </Card>

              {/* Activity Timeline */}
              <Card className="border-neutral-200">
                <CardHeader className="py-3 px-5 border-b border-neutral-100">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    Activity & Interaction Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {selectedCustomer.recentActivity.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 mt-0.5">
                        <Activity className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{act.title}</p>
                        <p suppressHydrationWarning className="text-[10px] text-neutral-400 font-mono mt-0.5">{act.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center text-xs text-neutral-400">Select a customer from the left to view profile.</Card>
          )}
        </div>
      </div>
    </div>
  );
}
