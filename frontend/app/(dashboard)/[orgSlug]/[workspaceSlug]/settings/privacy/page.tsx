'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield,
  Download,
  Trash2,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Building,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { Badge } from '../../../../../../components/ui/badge';
import { apiClient } from '../../../../../../lib/api-client';

export default function PrivacySettingsPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;

  const [loading, setLoading] = useState(true);
  const [downloadingUser, setDownloadingUser] = useState(false);
  const [downloadingOrg, setDownloadingOrg] = useState(false);
  const [consent, setConsent] = useState({
    analyticsConsent: true,
    marketingConsent: false,
    dataProcessingConsent: true,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConsent();
  }, []);

  const loadConsent = async () => {
    try {
      const res = await apiClient.get('/privacy/consent');
      if (res.data) {
        setConsent(res.data);
      }
    } catch (err) {
      console.error('Failed to load consent settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async (field: 'analyticsConsent' | 'marketingConsent') => {
    const updated = { ...consent, [field]: !consent[field] };
    setConsent(updated);
    try {
      await apiClient.post('/privacy/consent', updated);
      setStatusMessage('Privacy preferences updated successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update consent', err);
    }
  };

  const downloadUserData = async () => {
    setDownloadingUser(true);
    try {
      const res = await apiClient.get('/privacy/export/user');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-gdpr-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export user data', err);
    } finally {
      setDownloadingUser(false);
    }
  };

  const downloadOrgData = async () => {
    setDownloadingOrg(true);
    try {
      const res = await apiClient.get('/privacy/export/organization');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `org-${orgSlug}-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export org data', err);
    } finally {
      setDownloadingOrg(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          Privacy & Data Governance
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your GDPR / CCPA compliance, data portability exports, and account deletion policies.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* GDPR Data Portability Export Card */}
      <Card className="border-neutral-200">
        <CardHeader className="py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-neutral-700" />
            <CardTitle className="text-sm font-bold text-neutral-900">
              Data Portability Export (GDPR Article 20)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Download your personal data and organization workflow assets in machine-readable JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-neutral-100 bg-neutral-50 gap-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-neutral-500" />
              <div>
                <h4 className="text-xs font-semibold text-neutral-900">User Account Profile Package</h4>
                <p className="text-[11px] text-neutral-500">Includes profile, permissions, login audit trail, and consent records.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadUserData}
              disabled={downloadingUser}
              className="text-xs gap-1.5 shrink-0 border-neutral-200"
            >
              {downloadingUser ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span>Export User JSON</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-neutral-100 bg-neutral-50 gap-3">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-neutral-500" />
              <div>
                <h4 className="text-xs font-semibold text-neutral-900">Organization Complete Archive</h4>
                <p className="text-[11px] text-neutral-500">Includes workflows, versions, execution statistics, knowledge base metadata, and billing logs.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadOrgData}
              disabled={downloadingOrg}
              className="text-xs gap-1.5 shrink-0 border-neutral-200"
            >
              {downloadingOrg ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span>Export Organization JSON</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent & Privacy Preferences */}
      <Card className="border-neutral-200">
        <CardHeader className="py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neutral-700" />
            <CardTitle className="text-sm font-bold text-neutral-900">
              Consent & Tracking Preferences
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Control telemetry tracking, product analytics, and communication preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <div>
              <p className="text-xs font-semibold text-neutral-900">Essential Platform Operations</p>
              <p className="text-[11px] text-neutral-500">Required for authentication, RBAC, tenant isolation, and billing.</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">Mandatory</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <div>
              <p className="text-xs font-semibold text-neutral-900">Product Telemetry & Analytics</p>
              <p className="text-[11px] text-neutral-500">Helps us monitor execution latency, error rates, and improve AI model routing.</p>
            </div>
            <Button
              size="sm"
              variant={consent.analyticsConsent ? 'default' : 'outline'}
              onClick={() => handleToggleConsent('analyticsConsent')}
              className={`text-xs h-7 px-3 ${
                consent.analyticsConsent ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'border-neutral-200'
              }`}
            >
              {consent.analyticsConsent ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-semibold text-neutral-900">Marketing & Product Updates</p>
              <p className="text-[11px] text-neutral-500">Receive notifications regarding new AI models and enterprise features.</p>
            </div>
            <Button
              size="sm"
              variant={consent.marketingConsent ? 'default' : 'outline'}
              onClick={() => handleToggleConsent('marketingConsent')}
              className={`text-xs h-7 px-3 ${
                consent.marketingConsent ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'border-neutral-200'
              }`}
            >
              {consent.marketingConsent ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone: Permanent Deletions */}
      <Card className="border-neutral-200 bg-neutral-50/50">
        <CardHeader className="py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-neutral-700" />
            <CardTitle className="text-sm font-bold text-neutral-900">
              Danger Zone (Irreversible Actions)
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-neutral-500">
            Permanently delete your personal profile or cascade purge an entire organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white gap-3">
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Delete User Account (Right to be Forgotten)</h4>
              <p className="text-[11px] text-neutral-500">Permanently removes your login credentials, active sessions, and personal data.</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs shrink-0"
              onClick={() => {
                if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                  apiClient.delete('/privacy/account').then(() => {
                    window.location.href = '/login';
                  });
                }
              }}
            >
              Delete Account
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white gap-3">
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Delete Organization & All Workflows</h4>
              <p className="text-[11px] text-neutral-500">Permanently deletes all workspaces, DAG workflows, executions, knowledge base docs, and API keys.</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs shrink-0"
              onClick={() => {
                const conf = prompt(`To confirm deletion of ${orgSlug}, type DELETE-ORGANIZATION below:`);
                if (conf === 'DELETE-ORGANIZATION') {
                  apiClient.delete('/privacy/organization').then(() => {
                    window.location.href = '/';
                  });
                }
              }}
            >
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
