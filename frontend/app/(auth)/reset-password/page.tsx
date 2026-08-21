'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cpu, ArrowRight, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { apiClient } from '../../../lib/api-client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    if (urlEmail) setEmail(urlEmail);
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/reset-password', {
        email,
        token,
        newPassword,
        confirmNewPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login?reset=true');
      }, 2000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.details ||
        'Failed to reset password. The link may have expired.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-neutral-200 dark:border-neutral-800">
      <CardHeader className="text-center space-y-2 pb-6">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
          <Cpu className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white">
          Create New Password
        </CardTitle>
        <CardDescription className="text-xs">
          Enter your new password to restore access to your account
        </CardDescription>
      </CardHeader>

      {success ? (
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            Password has been reset successfully! Redirecting you to sign in...
          </p>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!searchParams.get('token') && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Reset Token
                </label>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from email"
                  className="text-xs font-mono"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
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
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 upper, 1 special"
                  className="pl-9 text-xs"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-9 text-xs"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-xs gap-2 mt-2"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-neutral-100 dark:border-neutral-900 pt-4">
            <Link href="/login" className="text-xs text-neutral-500 hover:text-blue-600">
              Cancel and Return to Sign In
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <Suspense fallback={<div>Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
