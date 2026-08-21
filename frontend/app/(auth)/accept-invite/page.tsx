'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Users, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      validateInvite(urlToken);
    } else {
      setLoading(false);
      setError('No invitation token provided in the URL');
    }
  }, [searchParams]);

  const validateInvite = async (tok: string) => {
    try {
      const res = await apiClient.get(`/invitations/validate?token=${tok}`);
      const data = res.data?.data || res.data;
      setInviteData(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'This invitation link is invalid, expired, or has already been used.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/accept-invite?token=${token}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post('/invitations/accept', { token });
      const data = res.data?.data || res.data;
      setSuccess(true);
      setTimeout(() => {
        const orgSlug = data?.organization?.slug || inviteData?.organization?.slug || 'acme-corp';
        router.push(`/${orgSlug}/default`);
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to accept invitation. Please try again or contact your administrator.',
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md shadow-xl border-neutral-200 dark:border-neutral-800 text-center p-8">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Validating your invitation token...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md shadow-xl border-neutral-200 dark:border-neutral-800 text-center p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">
          Invitation Expired or Invalid
        </CardTitle>
        <CardDescription className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
          {error}
        </CardDescription>
        <div className="mt-6">
          <Link href="/login">
            <Button variant="outline" className="w-full text-xs">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-xl border-neutral-200 dark:border-neutral-800 text-center p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">
          Welcome to the Team!
        </CardTitle>
        <CardDescription className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
          You have successfully joined <span className="font-semibold text-neutral-900 dark:text-white">{inviteData?.organization?.name}</span> as <span className="font-semibold capitalize text-blue-600">{inviteData?.role}</span>.
        </CardDescription>
        <p className="text-[11px] text-neutral-400 mt-4">Redirecting to your workspace...</p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-neutral-200 dark:border-neutral-800 text-center">
      <CardHeader className="space-y-2 pb-4 border-b border-neutral-100 dark:border-neutral-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
          <Users className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white">
          You&apos;ve Been Invited!
        </CardTitle>
        <CardDescription className="text-xs">
          <strong>{inviteData?.invitedBy}</strong> has invited you to collaborate
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6 text-left">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Organization:</span>
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              {inviteData?.organization?.name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Assigned Role:</span>
            <Badge variant="outline" className="capitalize text-xs font-semibold">
              {inviteData?.role}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Invited Email:</span>
            <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
              {inviteData?.email}
            </span>
          </div>
        </div>

        <Button
          onClick={handleAccept}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-xs gap-2 py-2.5"
        >
          <span>{submitting ? 'Joining Team...' : 'Accept Invitation & Join Team'}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-neutral-100 dark:border-neutral-900 pt-4">
        <Link href="/login" className="text-xs text-neutral-500 hover:text-blue-600">
          Sign in with a different account
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <Suspense fallback={<div>Loading invitation...</div>}>
        <AcceptInviteContent />
      </Suspense>
    </div>
  );
}
