'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Bot,
  Cpu,
  GitFork,
  Home,
  Layers,
  Plug,
  Settings,
  ShieldCheck,
  Zap,
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

  const navItems = [
    { label: 'Overview', href: `${basePath}`, icon: Home, exact: true },
    { label: 'Workflows', href: `${basePath}/workflows`, icon: GitFork },
    { label: 'Executions', href: `${basePath}/executions`, icon: Activity },
    { label: 'AI Agents', href: `${basePath}/ai-agents`, icon: Bot },
    { label: 'Integrations', href: `${basePath}/integrations`, icon: Plug },
    { label: 'Analytics', href: `${basePath}/analytics`, icon: Zap },
    { label: 'Settings', href: `${basePath}/settings`, icon: Settings },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-neutral-50/75 dark:border-neutral-800 dark:bg-neutral-950 shrink-0">
      {/* Brand & Platform Header */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
          <Cpu className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Automa<span className="text-blue-600">AI</span>
          </span>
          <span className="text-[10px] text-neutral-500 font-medium tracking-wide uppercase">
            Enterprise SaaS
          </span>
        </div>
      </div>

      {/* Tenant & Workspace Hierarchy Switchers */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
        <OrgSwitcher />
        <WorkspaceSwitcher />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
          Workspace Automation
        </div>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer System Status & Multi-Tenant Badge */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              Queues Operational
            </span>
          </div>
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
        </div>
      </div>
    </aside>
  );
}
