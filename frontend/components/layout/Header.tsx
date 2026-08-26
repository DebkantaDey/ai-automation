'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Search,
  Sparkles,
  Command,
  Plus,
  Zap,
  Globe,
  Bot,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useTenantStore } from '../../stores/tenant-store';
import { UserNav } from './UserNav';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function Header() {
  const router = useRouter();
  const { currentOrganization, currentWorkspace } = useTenantStore();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [query, setQuery] = useState('');

  const orgSlug = currentOrganization?.slug || 'acme-corp';
  const wsSlug = currentWorkspace?.slug || 'default';
  const basePath = `/${orgSlug}/${wsSlug}`;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickLinks = [
    { title: 'Overview Command Center', href: `${basePath}`, icon: Zap },
    { title: 'CRM Deals & Pipeline', href: `${basePath}/crm`, icon: Layers },
    { title: 'Leads & AI Scoring Hub', href: `${basePath}/crm/leads`, icon: Sparkles },
    { title: '360° Customer Profiles', href: `${basePath}/crm/customers`, icon: Globe },
    { title: 'Unified Inbox (WhatsApp & Email)', href: `${basePath}/inbox`, icon: Bot },
    { title: 'Calendar & Appointments', href: `${basePath}/calendar`, icon: Layers },
    { title: 'Automated Tasks Board', href: `${basePath}/tasks`, icon: Layers },
    { title: 'Invoices & Billing Ledger', href: `${basePath}/invoices`, icon: Zap },
    { title: 'Human Approval Gate', href: `${basePath}/approvals`, icon: Sparkles },
    { title: 'New Automation Workflow', href: `${basePath}/workflows`, icon: Zap },
    { title: 'Autonomous AI Agents Studio', href: `${basePath}/agents`, icon: Bot },
    { title: 'Execution Trace History', href: `${basePath}/executions`, icon: Layers },
    { title: 'Vector Knowledge Base (RAG)', href: `${basePath}/knowledge-base`, icon: BookOpen },
    { title: 'Workflow Templates Catalog', href: `${basePath}/templates`, icon: Sparkles },
    { title: 'Telemetry & Resource Quotas', href: `${basePath}/analytics`, icon: Layers },
  ];

  const filteredLinks = query.trim()
    ? quickLinks.filter((l) => l.title.toLowerCase().includes(query.toLowerCase()))
    : quickLinks;

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-5 sticky top-0 z-10">
        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href={`/${orgSlug}/${wsSlug}`}
            className="flex items-center gap-1.5 font-semibold text-neutral-800 hover:text-neutral-900 transition-colors"
          >
            <span>{currentOrganization?.name || 'Organization'}</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <div className="flex items-center gap-1.5 font-medium text-neutral-600">
            <span
              className="h-2 w-2 rounded-full bg-neutral-800"
            />
            <span className="text-neutral-900 font-semibold">
              {currentWorkspace?.name || 'Workspace'}
            </span>
          </div>

          <Badge variant="success" className="ml-2 hidden sm:inline-flex text-[10px] py-0 h-4.5 font-mono" dot>
            Live Partition
          </Badge>
        </div>

        {/* Global Actions and Command Search */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSearchModal(true)}
            className="hidden md:flex items-center gap-3 h-8.5 w-60 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-400 hover:border-neutral-300 hover:bg-neutral-100 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-neutral-500 text-xs">Quick search...</span>
            </div>
            <kbd className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600">
              ⌘K
            </kbd>
          </button>

          <Link href={`${basePath}/workflows`}>
            <Button size="sm" className="gap-1.5 shadow-sm bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Pipeline</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-neutral-200 mx-0.5" />

          <UserNav />
        </div>
      </header>

      {/* Global Command Palette Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-20">
          <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center gap-2.5 border-b border-neutral-200 px-4 py-3">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                autoFocus
                placeholder="Type a command or search platform features..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-[11px] font-mono text-neutral-400 hover:text-neutral-600 border rounded px-1.5 py-0.5 cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Navigation & Actions
              </div>
              {filteredLinks.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-6">No matching actions found</p>
              ) : (
                filteredLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setShowSearchModal(false);
                        router.push(item.href);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs hover:bg-neutral-100 text-neutral-800 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-700" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
