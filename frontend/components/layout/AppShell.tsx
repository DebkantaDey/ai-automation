'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TrialBanner } from './TrialBanner';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100/50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TrialBanner />
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
