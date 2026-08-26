'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  TrendingUp,
  Users,
  Sparkles,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';

const fallbackDeals = [
  { id: 'deal-1', title: 'Enterprise Omnichannel License', company: 'Global Logistics Corp', value: 48000, stage: 'Proposal Sent', probability: 80, contact: 'Sarah Jenkins', closeDate: '2026-09-15' },
  { id: 'deal-2', title: 'AI Support Desk Automation', company: 'HealthTech Clinics', value: 24000, stage: 'Qualified', probability: 60, contact: 'Dr. Robert Miller', closeDate: '2026-09-22' },
  { id: 'deal-3', title: 'WhatsApp Automated Booking Pipeline', company: 'Apex Real Estate', value: 36000, stage: 'Negotiation', probability: 85, contact: 'Elena Rostova', closeDate: '2026-09-10' },
  { id: 'deal-4', title: 'Customer Lead Scoring Gateway', company: 'Nexus FinServe', value: 72000, stage: 'Won', probability: 100, contact: 'Michael Chen', closeDate: '2026-08-20' },
];

export default function CrmOverviewPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';
  const basePath = `/${orgSlug}/${wsSlug}`;

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = fallbackDeals.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              CRM & Revenue Pipeline
            </h1>
            <Badge variant="emerald" className="text-[10px] font-mono">
              Live Pipeline
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Track deals, lead conversion stages, sales probability, and customer relationship value.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`${basePath}/crm/leads`}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Lead Scoring Hub</span>
            </Button>
          </Link>
          <Link href={`${basePath}/crm/customers`}>
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
              <Users className="h-3.5 w-3.5" />
              <span>360° Customers</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Total Pipeline Value</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">$180,000</span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+$32,000 this month</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Weighted Pipeline</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">$146,800</span>
            <p className="text-[11px] text-neutral-400 mt-1">Probability-Adjusted</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Active Qualified Leads</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">48</span>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">87% AI Qualification Rate</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Win Rate</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">34.2%</span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">+4.8% vs last quarter</p>
          </div>
        </Card>
      </div>

      {/* Active Pipeline Deals Table */}
      <Card className="border-neutral-200/80 dark:border-neutral-800/80">
        <CardHeader className="py-3 px-5 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">Active Deals & Opportunities</CardTitle>
            <CardDescription className="text-xs">Live deals managed by your sales team and AI sales agents</CardDescription>
          </div>
          <div className="w-64">
            <Input
              placeholder="Search deals..."
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
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-medium bg-neutral-50/60 dark:bg-neutral-900/50">
                  <th className="py-3 px-5">Deal Title</th>
                  <th className="py-3 px-5">Company / Client</th>
                  <th className="py-3 px-5">Value</th>
                  <th className="py-3 px-5">Stage</th>
                  <th className="py-3 px-5">Probability</th>
                  <th className="py-3 px-5">Expected Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3 px-5 font-semibold text-neutral-900 dark:text-white">
                      {deal.title}
                    </td>
                    <td className="py-3 px-5 text-neutral-600 dark:text-neutral-300">
                      {deal.company}
                      <span className="block text-[10px] text-neutral-400">{deal.contact}</span>
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-neutral-900 dark:text-white">
                      ${deal.value.toLocaleString()}
                    </td>
                    <td className="py-3 px-5">
                      <Badge
                        variant={deal.stage === 'Won' ? 'success' : deal.stage === 'Negotiation' ? 'warning' : 'outline'}
                        className="text-[9px] font-mono uppercase"
                      >
                        {deal.stage}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-700 dark:text-neutral-300">{deal.probability}%</span>
                        <div className="w-12 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${deal.probability}%` }} />
                        </div>
                      </div>
                    </td>
                    <td suppressHydrationWarning className="py-3 px-5 text-neutral-400 font-mono text-[11px]">
                      {deal.closeDate}
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
