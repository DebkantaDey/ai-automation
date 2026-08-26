'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Globe, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { apiClient } from '../../lib/api-client';
import { useTenantStore } from '../../stores/tenant-store';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { setCurrentOrganization, setCurrentWorkspace } = useTenantStore();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: 'Technology',
    website: '',
    description: '',
    country: 'US',
    timezone: 'UTC',
    defaultCurrency: 'USD',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: autoSlug,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/organizations', formData);
      const data = res.data?.data || res.data;

      if (data?.organization) {
        setCurrentOrganization(data.organization);
        if (data.workspace) {
          setCurrentWorkspace(data.workspace);
        }
        router.push(`/${data.organization.slug}/default`);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.details ||
        'Failed to create organization. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 bg-canvas-dots">
      <Card className="w-full max-w-xl shadow-lg border-neutral-200 bg-white">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-neutral-100">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-none">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-900">
            Set up your Business Organization
          </CardTitle>
          <CardDescription className="text-xs max-w-md mx-auto">
            Organizations establish secure tenant boundaries for your workflows, AI agents, team members, and telemetry.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Organization / Company Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Tenant Slug (Auto-generated) *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. acme-corp"
                  className="text-xs font-mono h-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-900"
                >
                  <option value="Technology">Technology & SaaS</option>
                  <option value="E-Commerce">E-Commerce & Retail</option>
                  <option value="Finance">Financial Services</option>
                  <option value="Healthcare">Healthcare & Biotech</option>
                  <option value="Marketing">Marketing & Advertising</option>
                  <option value="Logistics">Logistics & Supply Chain</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Organization Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what your company automates"
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900"
                >
                  <option value="US">United States (US)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="SG">Singapore (SG)</option>
                  <option value="IN">India (IN)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900"
                >
                  <option value="UTC">UTC (+00:00)</option>
                  <option value="America/New_York">US Eastern (EST/EDT)</option>
                  <option value="America/Chicago">US Central (CST/CDT)</option>
                  <option value="America/Los_Angeles">US Pacific (PST/PDT)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Currency
                </label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3.5 flex items-start gap-2.5 text-xs text-neutral-800">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-neutral-700" />
              <div>
                <p className="font-bold text-neutral-900">Multi-Tenant Partition Initialization</p>
                <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                  Creating this organization provisions an isolated tenant database partition, initializes your default workspace, and grants you Owner permissions.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-xs gap-2 py-2.5 font-semibold text-white h-9.5"
            >
              <span>Create Organization & Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
