'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sparkles, Clock, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';

export function TrialBanner() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [statusDetails, setStatusDetails] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!orgSlug) return;
      try {
        const res = await apiClient.get('/billing/subscription');
        const data = res.data?.data || res.data;
        if (data?.statusDetails) {
          setStatusDetails(data.statusDetails);
        }
      } catch {
        // Handled silently
      }
    }
    checkSubscription();
  }, [orgSlug]);

  if (!statusDetails || dismissed) return null;

  const billingUrl = `/${orgSlug}/${wsSlug}/settings/billing`;

  // 1. Trial Expired Banner (Critical - Non-dismissible)
  if (statusDetails.isTrialExpired || statusDetails.state === 'trial_expired') {
    return (
      <div className="bg-red-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" />
          <span>
            <strong>Trial Expired:</strong> Your free trial period has elapsed. Workspaces and workflows are currently in read-only mode.
          </span>
        </div>
        <Link href={billingUrl}>
          <Button size="sm" className="bg-white text-red-700 hover:bg-neutral-100 text-xs font-bold h-7 px-3 gap-1 shadow-sm">
            <span>Upgrade Plan</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    );
  }

  // 2. Grace Period Warning
  if (statusDetails.isInGracePeriod || statusDetails.state === 'past_due_grace') {
    return (
      <div className="bg-amber-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            <strong>Payment Past Due:</strong> {statusDetails.graceRemainingDays} day(s) remaining in your grace period before workspace access is restricted.
          </span>
        </div>
        <Link href={billingUrl}>
          <Button size="sm" className="bg-white text-amber-800 hover:bg-neutral-100 text-xs font-bold h-7 px-3 gap-1 shadow-sm">
            <span>Update Billing</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    );
  }

  // 3. Trial Expiring Soon (< 2 days)
  if (statusDetails.state === 'trial_expiring_soon') {
    return (
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            <strong>Trial Ending Soon:</strong> You have {statusDetails.trialRemainingHours} hour(s) left in your trial. Upgrade to keep automations running seamlessly.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={billingUrl}>
            <Button size="sm" className="bg-white text-orange-700 hover:bg-neutral-100 text-xs font-bold h-7 px-3 gap-1 shadow-sm">
              <span>Upgrade Now</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 4. Active Trial Banner
  if (statusDetails.isTrial && statusDetails.state === 'trial_active') {
    return (
      <div className="bg-blue-600 text-white px-4 py-1.5 text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-blue-200 shrink-0" />
          <span>
            You are on a <strong>Free Trial ({statusDetails.trialRemainingDays} days remaining)</strong>. Explore workflows, AI agents, and integrations.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={billingUrl} className="underline font-semibold hover:text-blue-100 text-[11px]">
            View Plans & Upgrade
          </Link>
          <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white p-1">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
