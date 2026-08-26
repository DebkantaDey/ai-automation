'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cpu, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');

    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
      setResendEmail(urlEmail);
      verifyToken(urlToken, urlEmail);
    }
  }, [searchParams]);

  const verifyToken = async (tok: string, mail: string) => {
    setStatus('verifying');
    setMessage('Validating your email verification token...');

    try {
      const res = await apiClient.post('/auth/verify-email', {
        token: tok,
        email: mail,
      });
      const data = res.data?.data || res.data;

      setStatus('success');
      setMessage('Your email address has been successfully verified.');

      if (data?.tokens && data?.user) {
        setAuth(data.user, data.tokens);
        setTimeout(() => {
          router.push('/acme-corp/default');
        }, 2000);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(
        err.response?.data?.message ||
        'The verification token is invalid or has expired. Please request a new link.',
      );
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (token && email) {
      verifyToken(token, email);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      await apiClient.post('/auth/resend-verification', { email: resendEmail });
      setResendSuccess('A new verification email has been dispatched. Please check your inbox.');
    } catch (err: any) {
      setResendSuccess('If an unverified account exists with this email, a link has been sent.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-neutral-200 bg-white text-center">
      <CardHeader className="space-y-2 pb-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-none">
          <Cpu className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold text-neutral-900">
          Email Verification
        </CardTitle>
        <CardDescription className="text-xs">
          Confirming tenant email for workspace security
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === 'verifying' && (
          <div className="py-6 space-y-3">
            <RefreshCw className="h-8 w-8 text-neutral-800 animate-spin mx-auto" />
            <p className="text-xs text-neutral-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-xs text-neutral-700 font-medium">{message}</p>
            <p className="text-[11px] text-neutral-400">Redirecting to your workspace...</p>
            <Link href="/login?verified=true">
              <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs mt-2">
                Continue to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <p className="text-xs font-semibold text-neutral-700 mb-2">
                Resend verification email:
              </p>
              <form onSubmit={handleResend} className="space-y-2">
                <Input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="text-xs"
                  required
                />
                <Button
                  type="submit"
                  disabled={resending}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs"
                >
                  {resending ? 'Sending...' : 'Resend Verification Link'}
                </Button>
                {resendSuccess && (
                  <p className="text-[11px] text-emerald-600 mt-1">
                    {resendSuccess}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <form onSubmit={handleManualVerify} className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Account Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Verification Token
              </label>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste verification token"
                className="text-xs font-mono"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs">
              Verify Account
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-neutral-100 pt-4">
        <Link href="/login" className="text-xs text-neutral-500 hover:text-neutral-900">
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Suspense fallback={<div>Loading verification...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
