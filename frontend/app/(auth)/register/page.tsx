'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Cpu, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { apiClient } from '../../../lib/api-client';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Compute password strength score (0 - 4)
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&#^~_+=<>/-]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength < 3) {
      setError('Please choose a stronger password (must contain uppercase, number, and special character)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/register', formData);
      setSuccess(true);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.details ||
        'Registration failed. Please check your details.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleMicrosoftSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    window.location.href = `${apiUrl}/auth/microsoft`;
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md shadow-lg border-neutral-200 text-center p-6 bg-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-900">
            Verify your email address
          </CardTitle>
          <CardDescription className="text-xs text-neutral-600 mt-2">
            We sent a verification link to <span className="font-semibold text-neutral-900">{formData.email}</span>.
            Please check your inbox to activate your organization and start automating.
          </CardDescription>

          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login">
              <Button variant="default" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg border-neutral-200 bg-white">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-none">
            <Cpu className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-900">
            Create Organization Tenant
          </CardTitle>
          <CardDescription className="text-xs">
            Start automating with AI workflows & queue workers
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Social OAuth Signups */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                className="w-full text-xs gap-2 border-neutral-200 hover:bg-neutral-50"
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
                onClick={handleMicrosoftSignup}
                className="w-full text-xs gap-2 border-neutral-200 hover:bg-neutral-50"
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

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-2 text-[10px] text-neutral-400 uppercase tracking-wider absolute font-semibold">
                Or fill details
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Organization / Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="Acme Technologies"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Alex"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Last Name
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Morgan"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                  className="pl-9 text-xs"
                  required
                />
              </div>
              {formData.password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Password strength:</span>
                    <span className="font-semibold text-neutral-900">{strengthLabels[strength - 1] || 'Weak'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 transition-all ${
                          strength >= level ? 'bg-neutral-900' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                required
              />
              <label htmlFor="terms" className="text-[11px] text-neutral-600">
                I agree to the Enterprise Master Services Agreement and Privacy Policy.
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !agreeTerms}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs gap-2 mt-2"
            >
              <span>{loading ? 'Creating Tenant...' : 'Create Account & Organization'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex justify-center border-t border-neutral-100 pt-4">
          <p className="text-xs text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-neutral-900 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
