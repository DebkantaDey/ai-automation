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

export default function AutomationTemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [nlPrompt, setNlPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloningSlug, setCloningSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/templates');
      setTemplates(res.data?.data || res.data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load templates catalog' });
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to clone template' });
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
      setMessage({ type: 'success', text: 'AI generated workflow DAG successfully!' });
      router.push(`/${orgSlug}/${wsSlug}/workflows/${createdWorkflow._id}`);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate workflow' });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  const categories = ['All', 'Sales', 'Support', 'E-commerce', 'HR'];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Automation Templates & Natural Language Builder
          </h1>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Clone pre-built enterprise automation workflows or describe what you want in plain text to let AI build the DAG.
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

      {/* AI Text-to-Workflow Prompt Bar */}
      <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-white dark:from-blue-950/20 dark:via-purple-950/20 dark:to-neutral-950 p-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              AI Natural Language Workflow Generator
            </h2>
          </div>

          <form onSubmit={handleGenerateFromNl} className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder='e.g. "When a lead arrives from my website, score it with AI, add it to HubSpot, and send a Slack message if score > 80"'
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                className="text-xs bg-white dark:bg-neutral-900"
                disabled={isGenerating}
              />
              <Button
                type="submit"
                disabled={isGenerating || !nlPrompt.trim()}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isGenerating ? 'Building DAG...' : 'Generate Workflow'}</span>
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
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
              className="p-5 flex flex-col justify-between border-neutral-200 dark:border-neutral-800 hover:border-blue-500/50 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
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
                  <span>{template.triggerType} Trigger</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4 flex items-center justify-end">
                <Button
                  size="sm"
                  disabled={isCloning}
                  onClick={() => handleClone(template.slug)}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  <span>{isCloning ? 'Cloning...' : 'Use Template'}</span>
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
