'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Headphones,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';

const fallbackTickets = [
  {
    id: 'TICK-801',
    subject: 'Webhook signature validation fails on Node 20 runtime',
    customer: 'David Vance (Global Logistics Corp)',
    category: 'Technical',
    priority: 'HIGH',
    status: 'Open',
    assignedTo: 'Support AI Agent',
    sentiment: 'Neutral',
    aiSummary: 'Customer reporting HMAC SHA-256 header mismatch on raw body buffer.',
    createdAt: '2026-08-25T11:20:00.000Z',
  },
  {
    id: 'TICK-802',
    subject: 'Request to increase monthly WhatsApp rate limit to 5,000 req/min',
    customer: 'Dr. Emily Watson (HealthTech Clinics)',
    category: 'Billing & Limits',
    priority: 'MEDIUM',
    status: 'In Progress',
    assignedTo: 'Maria Santos (Account Exec)',
    sentiment: 'Positive',
    aiSummary: 'Tier upgrade enquiry for multi-location dental reminder blast.',
    createdAt: '2026-08-25T10:00:00.000Z',
  },
  {
    id: 'TICK-803',
    subject: 'Invoice payment wire receipt verification',
    customer: 'Michael Chen (Nexus FinServe)',
    category: 'Finance',
    priority: 'LOW',
    status: 'Resolved',
    assignedTo: 'AI Finance Agent',
    sentiment: 'Positive',
    aiSummary: 'Attached wire confirmation for invoice #INV-2026-091 verified.',
    createdAt: '2026-08-24T16:00:00.000Z',
  },
];

export default function SupportTicketsPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [tickets, setTickets] = useState(fallbackTickets);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Customer Support Tickets Desk
            </h1>
            <Badge variant="purple" className="text-[10px] font-mono">
              Semantic Triage
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Automated customer issue categorization, sentiment analysis, AI response suggestions, and agent routing.
          </p>
        </div>

        <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
          <Plus className="h-3.5 w-3.5" />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* Tickets Table */}
      <Card className="border-neutral-200/80 dark:border-neutral-800/80">
        <CardHeader className="py-3 px-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">
            Support Queue ({filteredTickets.length})
          </CardTitle>
          <div className="w-64">
            <Input
              placeholder="Search ticket subject, client..."
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
                  <th className="py-3 px-5">Ticket</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Assigned Agent</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredTickets.map((tick) => (
                  <tr key={tick.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/60">
                    <td className="py-3 px-5">
                      <div className="font-semibold text-neutral-900 dark:text-white">{tick.subject}</div>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{tick.id}</p>
                    </td>
                    <td className="py-3 px-5 text-neutral-600 dark:text-neutral-300 font-medium">
                      {tick.customer}
                    </td>
                    <td className="py-3 px-5 font-mono text-neutral-500">{tick.category}</td>
                    <td className="py-3 px-5">
                      <Badge
                        variant={
                          tick.priority === 'HIGH'
                            ? 'destructive'
                            : tick.priority === 'MEDIUM'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[9px] font-mono"
                      >
                        {tick.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-5">
                      <Badge
                        variant={tick.status === 'Resolved' ? 'success' : tick.status === 'Open' ? 'default' : 'outline'}
                        className="text-[9px] font-mono uppercase"
                        dot
                      >
                        {tick.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 font-mono text-[11px] text-purple-600 dark:text-purple-400">
                      {tick.assignedTo}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-500">
                        <span>Inspect</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
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
