'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, CreditCard, Shield, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { useTenantStore } from '../../stores/tenant-store';
import { Badge } from '../ui/badge';

export function UserNav() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { currentOrganization, currentWorkspace } = useTenantStore();
  const [isOpen, setIsOpen] = useState(false);

  const orgSlug = currentOrganization?.slug || 'acme-corp';
  const wsSlug = currentWorkspace?.slug || 'default';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Alex Morgan';
  const displayEmail = user?.email || 'alex@acme.com';
  const initial = user?.firstName?.charAt(0) || 'A';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-neutral-300 transition-all focus:outline-none cursor-pointer"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold ring-1 ring-neutral-200 shadow-sm">
          {initial}
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="px-3 py-2.5 border-b border-neutral-100">
              <p className="text-xs font-bold text-neutral-900 truncate">{displayName}</p>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">{displayEmail}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <Badge variant="default" className="text-[9px] uppercase font-mono py-0">
                  {currentOrganization?.plan || 'PRO'}
                </Badge>
                <span className="text-[10px] text-neutral-400 capitalize font-mono">
                  {currentOrganization?.role || 'owner'}
                </span>
              </div>
            </div>

            <div className="py-1 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/${orgSlug}/${wsSlug}/settings`);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-neutral-400" />
                <span>Organization Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/${orgSlug}/${wsSlug}/settings/billing`);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                <span>Billing & Subscription</span>
              </button>
            </div>

            <div className="border-t border-neutral-100 pt-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
