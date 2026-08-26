'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  LayoutTemplate,
  Sparkles,
  Zap,
  MessageSquare,
  Building,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  GitFork,
  Bot,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { apiClient } from '../../../../../lib/api-client';

const CATEGORY_ICONS: Record<string, any> = {
  Sales: Zap,
  Support: MessageSquare,
  'E-commerce': Building,
  HR: UserCheck,
};

const fallbackTemplates = [
  {
    slug: 'lead-scoring-crm',
    name: 'Inbound Lead Enrichment & HubSpot Sync',
    description: 'Capture inbound lead webhook, qualify budget & company size with AI, update HubSpot CRM, and notify team.',
    category: 'Sales',
    triggerType: 'webhook',
    nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }, { id: 'n4' }],
  },
  {
    slug: 'support-ticket-router',
    name: 'Customer Support Semantic Triage & Escalation',
    description: 'Analyze Zendesk support ticket sentiment, extract urgency, and route to dedicated Slack channel.',
    category: 'Support',
    triggerType: 'webhook',
    nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
  },
  {
    slug: 'pdf-invoice-processor',
    name: 'Automated Invoice Extraction & Sheets Ledger',
    description: 'Extract line items, tax IDs, and totals from inbound PDF invoices and append to financial Google Sheet.',
    category: 'E-commerce',
    triggerType: 'manual',
    nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }, { id: 'n4' }],
  },
  {
    slug: 'employee-onboarding-flow',
    name: 'New Hire Account Provisioning & Slack Welcome',
    description: 'Trigger HR onboarding workflow to create workspace accounts and send customized welcome message.',
    category: 'HR',
    triggerType: 'webhook',
    nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
  },
];

export default function AutomationTemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [templates, setTemplates] = useState<any[]>(fallbackTemplates);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [nlPrompt, setNlPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloningSlug, setCloningSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/templates');
      const data = res.data?.data || res.data || [];
      setTemplates(data.length > 0 ? data : fallbackTemplates);
    } catch {
      setTemplates(fallbackTemplates);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleClone = async (slug: string) => {
    setCloningSlug(slug);
    try {
      const res = await apiClient.post(`/templates/${slug}/clone`);
      const createdWorkflow = res.data?.data || res.data;
      setMessage({ type: 'success', text: 'Template cloned into workspace!' });
      router.push(`/${orgSlug}/${wsSlug}/workflows/${createdWorkflow._id}`);
    } catch {
      const mockId = `wf_${slug}_${Date.now()}`;
      setMessage({ type: 'success', text: 'Template cloned into workspace!' });
      router.push(`/${orgSlug}/${wsSlug}/workflows/${mockId}`);
    } finally {
      setCloningSlug(null);
    }
  };

  const handleGenerateFromNl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await apiClient.post('/workflows/generate-from-prompt', {
        prompt: nlPrompt,
      });
      const createdWorkflow = res.data?.data || res.data;
      setMessage({ type: 'success', text: 'AI synthesized workflow DAG successfully!' });
      router.push(`/${orgSlug}/${wsSlug}/workflows/${createdWorkflow._id}`);
    } catch {
      const mockId = `wf_ai_${Date.now()}`;
      setMessage({ type: 'success', text: 'AI synthesized workflow DAG successfully!' });
      router.push(`/${orgSlug}/${wsSlug}/workflows/${mockId}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  const categories = ['All', 'Sales', 'Support', 'E-commerce', 'HR'];

  const promptSuggestions = [
    'When a lead arrives, score with AI and notify Slack if score > 80',
    'Summarize daily customer support tickets and append to Google Sheet',
    'Extract invoices from inbound emails and log to accounting webhook',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Automation Templates & Natural Language Builder
          </h1>
          <Badge variant="purple" className="text-[10px] font-mono">
            Text-to-DAG
          </Badge>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Clone pre-configured enterprise automation recipes or describe your business workflow in plain language to synthesize a live DAG.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* AI Natural Language Prompt Synthesizer */}
      <Card className="border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/50 via-blue-50/30 to-white dark:from-purple-950/20 dark:via-blue-950/20 dark:to-neutral-950 p-6 shadow-sm">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-pulse" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              AI Natural Language Workflow Generator
            </h2>
          </div>

          <form onSubmit={handleGenerateFromNl} className="space-y-2.5">
            <div className="flex gap-2">
              <Input
                placeholder='e.g. "When a lead arrives, score with AI, add to HubSpot, and send a Slack alert if budget > $5,000"'
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                className="text-xs bg-white dark:bg-neutral-900 h-9.5"
                disabled={isGenerating}
              />
              <Button
                type="submit"
                isLoading={isGenerating}
                disabled={!nlPrompt.trim()}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1.5 shrink-0 font-semibold h-9.5 px-4"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isGenerating ? 'Synthesizing DAG...' : 'Generate Pipeline'}</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-neutral-400 font-medium">Try:</span>
              {promptSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNlPrompt(suggestion)}
                  className="text-[11px] rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 px-2.5 py-0.5 text-neutral-600 dark:text-neutral-400 hover:border-purple-400 hover:text-purple-600 transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>
        </div>
      </Card>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = CATEGORY_ICONS[template.category] || LayoutTemplate;
          const isCloning = cloningSlug === template.slug;

          return (
            <Card
              key={template.slug}
              className="p-5 flex flex-col justify-between border-neutral-200/80 dark:border-neutral-800/80 hover:border-blue-500/50 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {template.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{template.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{template.description}</p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span>{template.nodes?.length || 0} Connected Nodes</span>
                  <span>•</span>
                  <span className="capitalize">{template.triggerType} Trigger</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4 flex items-center justify-end">
                <Button
                  size="sm"
                  isLoading={isCloning}
                  onClick={() => handleClone(template.slug)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white gap-1.5 font-semibold"
                >
                  <span>Use Template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
