'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cpu, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { apiClient } from '../../../lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Unable to process your request at this time. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg border-neutral-200 bg-white">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-none">
            <Cpu className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-900">
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your work email and we will send you a secure password reset link
          </CardDescription>
        </CardHeader>

        {submitted ? (
          <CardContent className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-xs text-neutral-600">
              If an account is associated with <span className="font-semibold text-neutral-900">{email}</span>, you will receive an email with instructions to reset your password within a few minutes.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full text-xs border-neutral-200">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs"
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </Button>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-neutral-100 pt-4">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
