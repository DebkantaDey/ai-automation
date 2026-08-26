'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';

const fallbackLeads = [
  {
    id: 'lead-101',
    name: 'David Vance',
    email: 'dvance@logistics-core.com',
    phone: '+1 (555) 234-5678',
    company: 'Global Logistics Corp',
    source: 'WhatsApp',
    status: 'Qualified',
    priority: 'HIGH',
    leadScore: 92,
    scoreReason: 'Requested enterprise plan, asked for live demo with 50+ seats, fast response time.',
    createdAt: '2026-08-25T10:15:00.000Z',
  },
  {
    id: 'lead-102',
    name: 'Dr. Emily Watson',
    email: 'dr.watson@healthclinics.org',
    phone: '+1 (555) 876-5432',
    company: 'HealthTech Clinics',
    source: 'Website Webhook',
    status: 'New',
    priority: 'HIGH',
    leadScore: 88,
    scoreReason: 'Multi-location medical group looking for automated appointment reminders.',
    createdAt: '2026-08-25T09:30:00.000Z',
  },
  {
    id: 'lead-103',
    name: 'Marcus Brody',
    email: 'mbrody@brodylegal.com',
    phone: '+1 (555) 432-1098',
    company: 'Brody & Partners Law',
    source: 'Email Inbound',
    status: 'Contacted',
    priority: 'MEDIUM',
    leadScore: 74,
    scoreReason: 'Inquired about document summarization & OCR invoice extraction.',
    createdAt: '2026-08-24T16:45:00.000Z',
  },
  {
    id: 'lead-104',
    name: 'Chloe Zhang',
    email: 'chloe@zhangcreatives.io',
    phone: '+1 (555) 345-6789',
    company: 'Zhang Creative Agency',
    source: 'WhatsApp',
    status: 'Proposal Sent',
    priority: 'MEDIUM',
    leadScore: 68,
    scoreReason: 'Solo design agency exploring AI client intake automation.',
    createdAt: '2026-08-24T14:20:00.000Z',
  },
  {
    id: 'lead-105',
    name: 'Kevin O’Connor',
    email: 'koconnor@generalmail.com',
    phone: '+1 (555) 987-6543',
    company: 'Self-Employed',
    source: 'Website',
    status: 'Lost',
    priority: 'LOW',
    leadScore: 32,
    scoreReason: 'Single student inquiry looking for free tier access.',
    createdAt: '2026-08-23T11:00:00.000Z',
  },
];

export default function LeadsScoringPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [leads, setLeads] = useState(fallbackLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Leads & AI Intent Scoring
            </h1>
            <Badge variant="default" className="text-[10px] font-mono">
              Predictive ML
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time lead qualification with explainable AI scoring, intent classification, and CRM stage progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 bg-neutral-50">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button size="sm" className="text-xs gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search leads by name, email, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', ...stages].map((stage) => (
            <button
              key={stage}
              onClick={() => setStatusFilter(stage)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === stage
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="border-neutral-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-medium bg-neutral-50">
                    <th className="py-3 px-5">Lead / Contact</th>
                    <th className="py-3 px-5">Company</th>
                    <th className="py-3 px-5">Source</th>
                    <th className="py-3 px-5">Stage</th>
                    <th className="py-3 px-5">AI Lead Score</th>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="font-semibold text-neutral-900">{lead.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{lead.email}</span>
                          <span>•</span>
                          <span>{lead.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-medium text-neutral-800">{lead.company}</td>
                      <td className="py-3 px-5 text-neutral-500 font-mono">{lead.source}</td>
                      <td className="py-3 px-5">
                        <Badge
                          variant={lead.status === 'Qualified' ? 'success' : lead.status === 'Lost' ? 'destructive' : 'outline'}
                          className="text-[9px] font-mono uppercase"
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-800 border border-neutral-200"
                          >
                            {lead.leadScore}/100
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium uppercase font-mono">{lead.priority}</span>
                        </div>
                      </td>
                      <td suppressHydrationWarning className="py-3 px-5 text-neutral-400 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-neutral-700 hover:text-neutral-900">
                          <span>Details</span>
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
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);

            return (
              <div key={stage} className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-2.5 flex flex-col space-y-2.5 min-h-[450px]">
                <div className="flex items-center justify-between pb-1 border-b border-neutral-200 text-xs font-bold text-neutral-700">
                  <span>{stage}</span>
                  <Badge variant="secondary" className="text-[9px] font-mono">
                    {stageLeads.length}
                  </Badge>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="p-3 cursor-pointer hover:border-neutral-300 hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-neutral-900">{lead.name}</span>
                        <span className="font-mono text-[10px] font-bold text-neutral-800">{lead.leadScore}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">{lead.company}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{lead.source}</p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Score Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">{selectedLead.name}</h2>
                <p className="text-xs text-neutral-500">{selectedLead.company}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-neutral-400 hover:text-neutral-600 text-sm cursor-pointer">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-neutral-700" />
                  AI Qualification & Scoring Rationale
                </span>
                <span className="text-sm font-bold font-mono text-neutral-900">
                  {selectedLead.leadScore} / 100
                </span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {selectedLead.scoreReason}
              </p>
            </div>

            <div className="space-y-2 text-xs divide-y divide-neutral-100">
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Email</span>
                <span className="font-semibold text-neutral-900">{selectedLead.email}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Phone</span>
                <span className="font-semibold text-neutral-900">{selectedLead.phone}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Inbound Channel</span>
                <span className="font-mono text-neutral-700">{selectedLead.source}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-neutral-500">Stage</span>
                <Badge variant="outline" className="text-[10px] font-mono">{selectedLead.status}</Badge>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
              <Link href={`/${orgSlug}/${wsSlug}/inbox`}>
                <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800 text-white">Open in Inbox</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
