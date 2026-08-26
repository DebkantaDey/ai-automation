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
        } else if (userOrganizations.length === 0) {
          const defaultOrgs: Organization[] = [
            { id: 'org_acme', name: 'Acme Corp', slug: 'acme-corp', plan: 'pro', role: 'owner' },
            { id: 'org_dev', name: 'Dev Labs', slug: 'dev-labs', plan: 'starter', role: 'admin' },
          ];
          setUserOrganizations(defaultOrgs);
          if (!currentOrganization) {
            setCurrentOrganization(defaultOrgs[0]);
          }
        }
      } catch {
        if (userOrganizations.length === 0) {
          const defaultOrgs: Organization[] = [
            { id: 'org_acme', name: 'Acme Corp', slug: 'acme-corp', plan: 'pro', role: 'owner' },
            { id: 'org_dev', name: 'Dev Labs', slug: 'dev-labs', plan: 'starter', role: 'admin' },
          ];
          setUserOrganizations(defaultOrgs);
          if (!currentOrganization) {
            setCurrentOrganization(defaultOrgs[0]);
          }
        }
      }
    }
    fetchOrgs();
  }, [params?.orgSlug, currentOrganization, setCurrentOrganization, setUserOrganizations]);

  const handleSelectOrg = async (org: Organization) => {
    setIsOpen(false);
    try {
      await apiClient.post(`/organizations/${org.id}/switch`);
      setCurrentOrganization(org);
      router.push(`/${org.slug}/default`);
    } catch {
      router.push(`/${org.slug}/default`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-left hover:border-neutral-300 shadow-none transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-900 font-bold text-white text-[11px]">
            {currentOrganization?.name?.charAt(0) || 'O'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-neutral-900 leading-tight">
              {currentOrganization?.name || 'Select Organization'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-neutral-400 font-mono capitalize">
                {currentOrganization?.role || 'Tenant'}
              </span>
              <span className="text-[10px] text-neutral-300">•</span>
              <span className="text-[10px] text-neutral-700 font-mono uppercase font-semibold">
                {currentOrganization?.plan || 'Free'}
              </span>
            </div>
          </div>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Organizations ({userOrganizations.length})
            </div>

            <div className="max-h-52 overflow-y-auto space-y-0.5">
              {userOrganizations.map((org: Organization) => {
                const isSelected =
                  (currentOrganization?.id && currentOrganization.id === org.id) ||
                  currentOrganization?.slug === org.slug;

                return (
                  <button
                    key={org.id || org.slug}
                    onClick={() => handleSelectOrg(org)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-900 font-semibold'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-200 font-bold text-[10px] text-neutral-800">
                        {org.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="truncate font-semibold">{org.name}</p>
                        <p className="text-[10px] text-neutral-400 capitalize font-mono">{org.role || 'Member'}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-neutral-900 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-neutral-100 mt-1 pt-1">
              <Link
                href="/create-organization"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-neutral-900 hover:bg-neutral-100 font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Organization</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
