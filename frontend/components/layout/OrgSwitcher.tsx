'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, Check, ChevronsUpDown, Plus, Sparkles } from 'lucide-react';
import { useTenantStore } from '../../stores/tenant-store';
import { apiClient } from '../../lib/api-client';
import { Badge } from '../ui/badge';
import { Organization } from '../../types';
import Link from 'next/link';

export function OrgSwitcher() {
  const router = useRouter();
  const params = useParams();
  const { currentOrganization, setCurrentOrganization, userOrganizations, setUserOrganizations } =
    useTenantStore();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await apiClient.get('/organizations');
        const orgs: Organization[] = res.data?.data || res.data || [];
        if (Array.isArray(orgs) && orgs.length > 0) {
          setUserOrganizations(orgs);
          if (!currentOrganization) {
            const activeSlug = params?.orgSlug as string;
            const matched = orgs.find((o: Organization) => o.slug === activeSlug) || orgs[0];
            setCurrentOrganization(matched);
          }
        }
      } catch (err) {
        // Handled silently
      }
    }
    fetchOrgs();
  }, [params?.orgSlug, currentOrganization, setCurrentOrganization, setUserOrganizations]);

  const handleSelectOrg = async (org: Organization) => {
    setIsOpen(false);
    setLoading(true);
    try {
      await apiClient.post(`/organizations/${org.id}/switch`);
      setCurrentOrganization(org);
      router.push(`/${org.slug}/default`);
    } catch {
      router.push(`/${org.slug}/default`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 font-bold text-white text-xs shadow-sm">
            {currentOrganization?.name?.charAt(0) || 'O'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
              {currentOrganization?.name || 'Select Organization'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-neutral-500 capitalize">
                {currentOrganization?.role || 'Tenant'}
              </span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 uppercase font-mono">
                {currentOrganization?.plan || 'Free'}
              </Badge>
            </div>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-xl">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Organizations ({userOrganizations.length})
            </div>

            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {userOrganizations.map((org: Organization) => {
                const isSelected =
                  (currentOrganization?.id && currentOrganization.id === org.id) ||
                  currentOrganization?.slug === org.slug;

                return (
                  <button
                    key={org.id || org.slug}
                    onClick={() => handleSelectOrg(org)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-800 font-bold text-[10px]">
                        {org.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="truncate font-medium">{org.name}</p>
                        <p className="text-[10px] text-neutral-400 capitalize">{org.role || 'Member'}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1.5 pt-1.5">
              <Link
                href="/create-organization"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Organization</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
