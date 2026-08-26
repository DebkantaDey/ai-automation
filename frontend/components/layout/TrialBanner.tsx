'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sparkles, Clock, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { Button } from '../ui/button';

interface SubscriptionStatusDetails {
  isTrial?: boolean;
  state?: string;
  trialRemainingDays?: number;
  trialRemainingHours?: number;
  isTrialExpired?: boolean;
  isInGracePeriod?: boolean;
  graceRemainingDays?: number;
}

export function TrialBanner() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [statusDetails, setStatusDetails] = useState<SubscriptionStatusDetails | null>(null);
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
      <div className="bg-rose-50 text-rose-900 border-b border-rose-200 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>
            <strong>Trial Expired:</strong> Your free trial period has elapsed. Workspaces and workflows are currently in read-only mode.
          </span>
        </div>
        <Link href={billingUrl}>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-7 px-3 gap-1 shadow-none">
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
      <div className="bg-amber-50 text-amber-900 border-b border-amber-200 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Payment Past Due:</strong> {statusDetails.graceRemainingDays} day(s) remaining in your grace period before workspace access is restricted.
          </span>
        </div>
        <Link href={billingUrl}>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-7 px-3 gap-1 shadow-none">
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
      <div className="bg-amber-50 text-amber-900 border-b border-amber-200 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Trial Ending Soon:</strong> You have {statusDetails.trialRemainingHours} hour(s) left in your trial. Upgrade to keep automations running seamlessly.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={billingUrl}>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-7 px-3 gap-1 shadow-none">
              <span>Upgrade Now</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <button onClick={() => setDismissed(true)} className="text-amber-700 hover:text-amber-900 p-1 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 4. Active Trial Banner
  if (statusDetails.isTrial && statusDetails.state === 'trial_active') {
    return (
      <div className="bg-neutral-50 text-neutral-900 border-b border-neutral-200 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
          <span>
            You are on a <strong>Free Trial ({statusDetails.trialRemainingDays} days remaining)</strong>. Explore multi-tenant workflows and AI agents.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={billingUrl} className="underline font-semibold hover:text-neutral-700 text-[11px]">
            View Plans & Upgrade
          </Link>
          <button onClick={() => setDismissed(true)} className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
