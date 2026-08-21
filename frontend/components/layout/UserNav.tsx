'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { useTenantStore } from '../../stores/tenant-store';

export function UserNav() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { currentOrganization } = useTenantStore();
  const [isOpen, setIsOpen] = useState(false);

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
        className="flex items-center gap-2 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-semibold dark:bg-neutral-100 dark:text-neutral-900">
          {initial}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="px-2 py-2 border-b border-neutral-100 dark:border-neutral-900">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{displayName}</p>
              <p className="text-[11px] text-neutral-500 truncate">{displayEmail}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 uppercase dark:bg-blue-950 dark:text-blue-300">
                  {currentOrganization?.plan || 'PRO'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  Role: {currentOrganization?.role || 'owner'}
                </span>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <Settings className="h-3.5 w-3.5 text-neutral-500" />
                <span>Account Settings</span>
              </button>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-900 pt-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
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
