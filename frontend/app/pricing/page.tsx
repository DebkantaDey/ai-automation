'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface PricingTier {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isPopular?: boolean;
  features: string[];
  limits: {
    users: string;
    workspaces: string;
    workflows: string;
    executions: string;
    aiTokens: string;
    storage: string;
  };
  cta: string;
  href: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Essential business automation for solopreneurs and small experiments',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Visual drag-and-drop workflow builder',
      'Standard webhook triggers',
      'Community forum support',
      'Execution log history (7 days)',
    ],
    limits: {
      users: '2 Team Members',
      workspaces: '1 Workspace',
      workflows: '5 Active Workflows',
      executions: '1,000 Executions / mo',
      aiTokens: '100,000 AI Tokens',
      storage: '500 MB Storage',
    },
    cta: 'Get Started Free',
    href: '/register',
  },
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for growing businesses expanding automation workflows',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Everything in Free, plus:',
      '10 Connected third-party integrations',
      'Custom webhook triggers & retry queues',
      'Email support (24h turnaround)',
      'Execution log history (30 days)',
    ],
    limits: {
      users: '5 Team Members',
      workspaces: '3 Workspaces',
      workflows: '25 Active Workflows',
      executions: '10,000 Executions / mo',
      aiTokens: '2,000,000 AI Tokens',
      storage: '5 GB Storage',
    },
    cta: 'Start 14-Day Trial',
    href: '/register?plan=starter',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Advanced automation, team roles, and high-volume AI processing for scale',
    monthlyPrice: 99,
    yearlyPrice: 990,
    isPopular: true,
    features: [
      'Everything in Starter, plus:',
      'Role-Based Access Control (Custom RBAC)',
      '50 Connected third-party integrations',
      'Autonomous AI agent tool orchestration',
      'Audit log trail & security export',
      'Priority support (4h SLA turnaround)',
    ],
    limits: {
      users: '20 Team Members',
      workspaces: '10 Workspaces',
      workflows: '100 Active Workflows',
      executions: '50,000 Executions / mo',
      aiTokens: '20,000,000 AI Tokens',
      storage: '50 GB Storage',
    },
    cta: 'Start 14-Day Trial',
    href: '/register?plan=business',
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Unlimited scale, dedicated AI infrastructure, custom integrations & SLA',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      'Everything in Business, plus:',
      'Unlimited team members & workspaces',
      'Custom dedicated AI gateways (BYO API key)',
      'Single Sign-On (SAML / Okta)',
      '99.99% Uptime SLA guarantee',
      'Dedicated Customer Success Manager',
    ],
    limits: {
      users: 'Unlimited Users',
      workspaces: 'Unlimited Workspaces',
      workflows: 'Unlimited Workflows',
      executions: '500,000+ Executions / mo',
      aiTokens: 'Unlimited AI Tokens',
      storage: '500 GB Storage',
    },
    cta: 'Contact Sales',
    href: '/register?plan=enterprise',
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-neutral-50/80 dark:bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8 bg-canvas-dots">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-blue-600 border-blue-300 dark:border-blue-800 text-xs px-3 py-1 font-semibold">
            Transparent Subscription Plans
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Scale Your Business Automations Seamlessly
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that matches your execution volume and team scale. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${interval === 'monthly' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setInterval(interval === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-neutral-200 dark:bg-neutral-800 transition-colors focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-blue-600 shadow transform ring-0 transition ease-in-out duration-200 ${
                  interval === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${interval === 'yearly' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
              Yearly Billing
              <Badge variant="success" className="text-[10px] px-1.5 py-0 font-mono">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier) => {
            const price = interval === 'yearly' ? Math.round(tier.yearlyPrice / 12) : tier.monthlyPrice;

            return (
              <Card
                key={tier.slug}
                className={`relative flex flex-col justify-between border transition-all ${
                  tier.isPopular
                    ? 'border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-600/30 dark:border-blue-500 bg-white dark:bg-neutral-900'
                    : 'border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-xs min-h-8 mt-1">
                    {tier.description}
                  </CardDescription>

                  <div className="pt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-neutral-500">
                      / month {interval === 'yearly' && '(billed yearly)'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex-1">
                  {/* Limits Breakdown */}
                  <div className="rounded-xl bg-neutral-100/70 dark:bg-neutral-950/60 p-3 space-y-1.5 text-xs border border-neutral-200/50 dark:border-neutral-800/50">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 text-[11px]">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Plan Quotas:
                    </p>
                    <div className="grid grid-cols-1 gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                      <div>• {tier.limits.users}</div>
                      <div>• {tier.limits.workspaces}</div>
                      <div>• {tier.limits.workflows}</div>
                      <div>• {tier.limits.executions}</div>
                      <div>• {tier.limits.aiTokens}</div>
                      <div>• {tier.limits.storage}</div>
                    </div>
                  </div>

                  {/* Feature Checkmarks */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Features Included:</p>
                    <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <Link href={tier.href} className="w-full">
                    <Button
                      variant={tier.isPopular ? 'default' : 'outline'}
                      className={`w-full text-xs gap-1.5 h-9 font-semibold ${
                        tier.isPopular ? 'bg-blue-600 hover:bg-blue-500 text-white' : ''
                      }`}
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
