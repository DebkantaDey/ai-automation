'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bot,
  BookOpen,
  Calendar,
  CheckSquare,
  Cpu,
  CreditCard,
  FileCheck,
  GitFork,
  Headphones,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  Plug,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  BarChart3,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useTenantStore } from '../../stores/tenant-store';
import { OrgSwitcher } from './OrgSwitcher';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { currentOrganization, currentWorkspace } = useTenantStore();

  const orgSlug = currentOrganization?.slug || 'acme-corp';
  const wsSlug = currentWorkspace?.slug || 'default';
  const basePath = `/${orgSlug}/${wsSlug}`;

  const navGroups = [
    {
      group: 'Core Engine',
      items: [
        { label: 'Overview', href: `${basePath}`, icon: LayoutDashboard, exact: true },
        { label: 'Workflows', href: `${basePath}/workflows`, icon: GitFork },
        { label: 'Live Executions', href: `${basePath}/executions`, icon: Activity, badge: 'Live' },
        { label: 'Approval Gate', href: `${basePath}/approvals`, icon: FileCheck },
      ],
    },
    {
      group: 'CRM & Sales',
      items: [
        { label: 'CRM Pipeline', href: `${basePath}/crm`, icon: TrendingUp },
        { label: 'Leads & AI Scoring', href: `${basePath}/crm/leads`, icon: Sparkles },
        { label: '360° Customers', href: `${basePath}/crm/customers`, icon: Users },
      ],
    },
    {
      group: 'Omnichannel & Ops',
      items: [
        { label: 'Unified Inbox', href: `${basePath}/inbox`, icon: Inbox, badge: 'WhatsApp' },
        { label: 'Calendar & Booking', href: `${basePath}/calendar`, icon: Calendar },
        { label: 'Tasks Board', href: `${basePath}/tasks`, icon: CheckSquare },
        { label: 'Invoices & Billing', href: `${basePath}/invoices`, icon: CreditCard },
        { label: 'Support Tickets', href: `${basePath}/tickets`, icon: Headphones },
      ],
    },
    {
      group: 'AI & Intelligence',
      items: [
        { label: 'AI Agents Studio', href: `${basePath}/agents`, icon: Bot },
        { label: 'Knowledge Base (RAG)', href: `${basePath}/knowledge-base`, icon: BookOpen },
        { label: 'Templates Catalog', href: `${basePath}/templates`, icon: LayoutTemplate },
      ],
    },
    {
      group: 'Configuration',
      items: [
        { label: 'App Connectors', href: `${basePath}/settings/integrations`, icon: Plug },
        { label: 'Telemetry & Quotas', href: `${basePath}/analytics`, icon: BarChart3 },
        { label: 'Settings', href: `${basePath}/settings`, icon: Settings },
      ],
    },
  ];

  // Find the single best matching item (longest matching href)
  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem = allItems
    .filter((item) => {
      if (item.exact) return pathname === item.href;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-neutral-200">
        <Link href={basePath} className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-sm group-hover:bg-neutral-800 transition-colors">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-neutral-900 leading-tight">
                AutomaAI
              </span>
              <span className="rounded bg-neutral-100 border border-neutral-200 px-1 py-0.2 text-[9px] font-semibold text-neutral-700 font-mono">
                2.0
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
              Enterprise Orchestration
            </span>
          </div>
        </Link>
      </div>

      {/* Switchers */}
      <div className="p-3 border-b border-neutral-200 space-y-2 bg-white">
        <OrgSwitcher />
        <WorkspaceSwitcher />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {group.group}
            </div>
            {group.items.map((item) => {
              const isActive = activeItem?.href === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-neutral-900 text-white font-semibold shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-white'
                          : 'text-neutral-400 group-hover:text-neutral-700',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && !isActive && (
                    <span className="flex items-center gap-1 rounded bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-700 font-mono">
                      {item.badge === 'Live' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status & Worker Health */}
      <div className="p-3 border-t border-neutral-200 bg-white">
        <Link
          href={`${basePath}/analytics`}
          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5 hover:border-neutral-300 transition-all group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-neutral-800 truncate leading-tight">
                9 BullMQ Queues
              </p>
              <p className="text-[10px] text-neutral-400 truncate">Operational • 0.0% DLQ</p>
            </div>
          </div>
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
