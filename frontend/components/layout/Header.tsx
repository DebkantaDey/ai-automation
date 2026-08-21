'use client';

import React from 'react';
import { ChevronRight, Search, Zap } from 'lucide-react';
import { useTenantStore } from '../../stores/tenant-store';
import { UserNav } from './UserNav';

export function Header() {
  const { currentOrganization, currentWorkspace } = useTenantStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Breadcrumb Hierarchy */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span className="font-medium text-neutral-900 dark:text-neutral-200">
          {currentOrganization?.name || 'Organization'}
        </span>
        <ChevronRight className="h-3 w-3 text-neutral-400" />
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {currentWorkspace?.name || 'Workspace'}
        </span>
      </div>

      {/* Global Actions and Search */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search workflows, executions, agents... (⌘K)"
            className="h-8 w-64 rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs placeholder:text-neutral-400 focus:border-blue-600 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
          />
        </div>

        <button className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <Zap className="h-3.5 w-3.5" />
          <span>New Automation</span>
        </button>

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

        <UserNav />
      </div>
    </header>
  );
}
