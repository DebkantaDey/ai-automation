'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cpu, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAuthStore } from '../../../stores/auth-store';
import { useTenantStore } from '../../../stores/tenant-store';
import { apiClient } from '../../../lib/api-client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const { setCurrentOrganization, setCurrentWorkspace } = useTenantStore();

  const [email, setEmail] = useState('alex@company.com');
  const [password, setPassword] = useState('Secret123!');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessNotice('Your email address has been verified! Please sign in.');
    } else if (searchParams.get('reset') === 'true') {
      setSuccessNotice('Password reset successfully. Please sign in with your new password.');
    } else if (searchParams.get('oauth_success') === 'true') {
      setSuccessNotice('OAuth authentication successful. Loading your workspace...');
      router.push('/acme-corp/default');
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/login', { email, password, rememberMe });
      const data = res.data?.data || res.data;

      if (data?.tokens) {
        setAuth(data.user, data.tokens);
        if (data.organization) {
          setCurrentOrganization(data.organization);
        }
        if (data.workspace) {
          setCurrentWorkspace(data.workspace);
        }
        const orgSlug = data.organization?.slug || 'acme-corp';
        const wsSlug = data.workspace?.slug || 'default';
        router.push(`/${orgSlug}/${wsSlug}`);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.details ||
        'Invalid email or password. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    window.location.href = `${apiUrl}/auth/microsoft`;
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-neutral-200 dark:border-neutral-800">
      <CardHeader className="text-center space-y-2 pb-6">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
          <Cpu className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white">
          Sign in to AutomaAI
        </CardTitle>
        <CardDescription className="text-xs">
          Multi-Tenant Enterprise Workflow Automation Platform
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Social OAuth Providers */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full text-xs gap-2 border-neutral-200 dark:border-neutral-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleMicrosoftLogin}
              className="w-full text-xs gap-2 border-neutral-200 dark:border-neutral-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
            <span className="bg-white dark:bg-neutral-900 px-2 text-[10px] text-neutral-400 uppercase tracking-wider absolute font-semibold">
              Or with work email
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
              Remember this device for 30 days
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-xs gap-2">
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </form>

      <CardFooter className="flex justify-center border-t border-neutral-100 dark:border-neutral-900 pt-4">
        <p className="text-xs text-neutral-500">
          Need an organization account?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Create Tenant
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <Suspense fallback={<div>Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
