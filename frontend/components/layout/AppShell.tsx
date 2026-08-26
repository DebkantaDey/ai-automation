'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TrialBanner } from './TrialBanner';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50/80 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-blue-500/20 selection:text-blue-600">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TrialBanner />
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
