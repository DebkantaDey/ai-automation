'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Globe,
  Clock,
  Coins,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  CreditCard,
  Trash2,
  Check,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Badge } from '../../../../../components/ui/badge';
import { apiClient } from '../../../../../lib/api-client';
import { useTenantStore } from '../../../../../stores/tenant-store';

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.orgSlug as string;
  const { currentOrganization, setCurrentOrganization } = useTenantStore();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    industry: 'Technology',
    website: '',
    timezone: 'UTC',
    country: 'US',
    defaultCurrency: 'USD',
    status: 'active',
    plan: 'free',
  });

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadOrgData() {
      setLoading(true);
      try {
        const res = await apiClient.get(`/organizations/by-slug/${orgSlug}`);
        const org = res.data?.data || res.data;

        if (org) {
          setFormData({
            id: org._id || org.id,
            name: org.name || '',
            slug: org.slug || '',
            description: org.description || '',
            industry: org.industry || 'Technology',
            website: org.website || '',
            timezone: org.timezone || 'UTC',
            country: org.country || 'US',
            defaultCurrency: org.defaultCurrency || 'USD',
            status: org.status || 'active',
            plan: org.plan || 'free',
          });

          // Fetch members
          try {
            const membersRes = await apiClient.get(`/organizations/${org._id || org.id}/members`);
            const membersList = membersRes.data?.data || membersRes.data || [];
            setMembers(membersList);
          } catch {
            // Ignore if members endpoint not available
          }
        }
      } catch (err: any) {
        setError('Failed to load organization settings');
      } finally {
        setLoading(false);
      }
    }

    if (orgSlug) {
      loadOrgData();
    }
  }, [orgSlug]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await apiClient.patch(`/organizations/${formData.id}`, {
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        website: formData.website,
        timezone: formData.timezone,
        country: formData.country,
        defaultCurrency: formData.defaultCurrency,
      });

      const updated = res.data?.data || res.data;
      if (updated) {
        setCurrentOrganization(updated);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to save organization settings. You may need Administrator permissions.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (deleteConfirm !== formData.slug) {
      setError(`Please type "${formData.slug}" to confirm deletion.`);
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await apiClient.delete(`/organizations/${formData.id}`);
      router.push('/create-organization');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Only organization owners can delete the organization.',
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs text-neutral-500 animate-pulse">Loading organization settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Organization Settings</h1>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Manage tenant configuration, business profile, localization, and team members.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Organization settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: General Business Information */}
        <Card className="border-neutral-200/80 dark:border-neutral-800/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">General Information</CardTitle>
                <CardDescription className="text-xs">
                  Public profile and company identifiers for this tenant partition.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={formData.status === 'active' ? 'success' : 'warning'} className="capitalize text-[10px]" dot>
                  {formData.status}
                </Badge>
                <Badge variant="outline" className="uppercase text-[10px] font-mono">
                  {formData.plan} Plan
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Organization Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Tenant Slug (Permanent ID)
                </label>
                <Input
                  value={formData.slug}
                  disabled
                  className="text-xs font-mono bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-75"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full h-8.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 text-xs text-neutral-900 dark:text-white"
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
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="pl-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Organization Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enterprise AI automation solutions provider"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Localization & Regional */}
        <Card className="border-neutral-200/80 dark:border-neutral-800/80">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Localization & Regional</CardTitle>
            <CardDescription className="text-xs">
              Timezone and currency formatting applied across workflow schedules and audit logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-neutral-400" />
                <span>Country</span>
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full h-8.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 text-xs text-neutral-900 dark:text-white"
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
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                <span>Timezone</span>
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full h-8.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 text-xs text-neutral-900 dark:text-white"
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
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-neutral-400" />
                <span>Default Currency</span>
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                className="w-full h-8.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 text-xs text-neutral-900 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <Button
              type="submit"
              isLoading={saving}
              className="bg-blue-600 hover:bg-blue-500 text-xs gap-1.5 font-semibold text-white"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Settings</span>
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Section 3: Organization Team Members */}
      <Card className="border-neutral-200/80 dark:border-neutral-800/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Team Members ({members.length})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Users with access to this tenant organization and its workspaces.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {members.map((member) => (
              <div key={member.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                    {member.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {member.fullName || `${member.firstName || ''} ${member.lastName || ''}`}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] capitalize font-mono">
                    {member.role}
                  </Badge>
                  <Badge variant="success" className="text-[10px] capitalize" dot>
                    {member.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Danger Zone */}
      <Card className="border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription className="text-xs text-rose-600/80 dark:text-rose-400/80">
            Deleting this organization permanently disables all workflows, scheduled tasks, AI agents, and tenant data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-neutral-700 dark:text-neutral-300">
            To delete this organization, type <span className="font-mono font-bold text-rose-600">{formData.slug}</span> below:
          </p>
          <div className="flex gap-2 max-w-md">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={`Type ${formData.slug} to confirm`}
              className="text-xs font-mono"
            />
            <Button
              type="button"
              variant="destructive"
              isLoading={deleting}
              disabled={deleteConfirm !== formData.slug}
              onClick={handleDeleteOrg}
              className="text-xs gap-1.5 shrink-0 bg-rose-600 hover:bg-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Organization</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
