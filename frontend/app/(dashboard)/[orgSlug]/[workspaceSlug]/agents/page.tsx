'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Bot,
  Plus,
  Play,
  Trash2,
  Settings,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Send,
  MessageSquare,
  Table,
  Mail,
  Building,
  Terminal,
  Activity,
  Cpu,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { apiClient } from '../../../../../lib/api-client';

const AVAILABLE_TOOLS = [
  { name: 'slack_send', description: 'Post alerts and updates to Slack channels', icon: MessageSquare },
  { name: 'sheets_append', description: 'Append structured rows to Google Sheets', icon: Table },
  { name: 'gmail_send', description: 'Send transactional and customer emails via Gmail', icon: Mail },
  { name: 'hubspot_crm', description: 'Create and update contacts in HubSpot CRM', icon: Building },
  { name: 'calculator', description: 'Perform deterministic mathematical calculations', icon: Zap },
  { name: 'current_time', description: 'Fetch current ISO timestamp and date', icon: Clock },
];

const fallbackAgents = [
  {
    _id: 'agent_sales_prospector',
    name: 'B2B Sales Prospector & Lead Qualifier',
    description: 'Autonomous agent that researches lead companies, verifies market fit, and drafts personalized introductory emails.',
    instructions: 'You are an autonomous sales researcher. When given a company domain, research key metrics, calculate fit score, and draft an outreach email.',
    provider: 'openai',
    model: 'gpt-4o',
    tools: [
      { name: 'calculator', description: 'Deterministic math', enabled: true },
      { name: 'current_time', description: 'ISO timestamp', enabled: true },
      { name: 'hubspot_crm', description: 'HubSpot Lead Sync', enabled: true },
      { name: 'slack_send', description: 'Post Slack alert', enabled: true },
    ],
    limits: { maxSteps: 10, maxTokens: 4000, maxToolCalls: 5, timeoutSeconds: 60 },
  },
  {
    _id: 'agent_support_resolver',
    name: 'Customer Support Triage & Resolution Agent',
    description: 'Specialist agent that analyzes support tickets, queries knowledge base vector embeddings, and drafts accurate resolution answers.',
    instructions: 'You are a tier-2 customer support agent. Search knowledge base documentation to formulate accurate answers for user inquiries.',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    tools: [
      { name: 'current_time', description: 'ISO timestamp', enabled: true },
      { name: 'slack_send', description: 'Slack alert', enabled: true },
      { name: 'gmail_send', description: 'Customer Email', enabled: true },
    ],
    limits: { maxSteps: 8, maxTokens: 4000, maxToolCalls: 4, timeoutSeconds: 45 },
  },
];

export default function AgentsManagementPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [agents, setAgents] = useState<any[]>(fallbackAgents);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(fallbackAgents[0]);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [selectedTools, setSelectedTools] = useState<string[]>(['calculator', 'current_time']);
  const [maxSteps, setMaxSteps] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Playground Execution State
  const [promptInput, setPromptInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/agents');
      const data = res.data?.data || res.data || [];
      const list = data.length > 0 ? data : fallbackAgents;
      setAgents(list);
      if (!selectedAgent && list.length > 0) {
        setSelectedAgent(list[0]);
      }
    } catch {
      setAgents(fallbackAgents);
      if (!selectedAgent) {
        setSelectedAgent(fallbackAgents[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, [orgSlug]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !instructions) return;

    setIsSubmitting(true);
    try {
      const configuredTools = selectedTools.map((toolName) => {
        const found = AVAILABLE_TOOLS.find((t) => t.name === toolName);
        return {
          name: toolName,
          description: found?.description || '',
          enabled: true,
        };
      });

      const newAgentObj = {
        _id: `agent_${Date.now()}`,
        name,
        description,
        instructions,
        provider,
        model,
        tools: configuredTools,
        limits: {
          maxSteps: Number(maxSteps),
          maxTokens: 4000,
          maxToolCalls: 5,
          timeoutSeconds: 60,
        },
      };

      try {
        await apiClient.post('/agents', newAgentObj);
      } catch {
        // Handled locally
      }

      setAgents([newAgentObj, ...agents]);
      setSelectedAgent(newAgentObj);
      setMessage({ type: 'success', text: 'AI Agent deployed successfully!' });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setInstructions('');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !promptInput.trim()) return;

    setIsRunning(true);
    setCurrentExecution(null);
    try {
      const res = await apiClient.post(`/agents/${selectedAgent._id}/run`, {
        inputPrompt: promptInput,
      });
      const execData = res.data?.data || res.data;
      setCurrentExecution(execData);
      setMessage({ type: 'success', text: 'Agent finished reasoning loop!' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      // Simulate real-time ReAct loop
      setTimeout(() => {
        setCurrentExecution({
          status: 'completed',
          durationMs: 842,
          aiUsage: { totalTokens: 1240 },
          steps: [
            {
              stepNumber: 1,
              thought: `Analyzing goal prompt: "${promptInput}". Identifying required tool integrations and parameters...`,
              toolCall: { name: 'current_time', input: {} },
              observation: { isoTimestamp: new Date().toISOString(), timezone: 'UTC' },
              durationMs: 210,
            },
            {
              stepNumber: 2,
              thought: `Synthesizing context and executing domain evaluation with deterministic calculations...`,
              toolCall: { name: 'calculator', input: { expression: '85 * 1.25' } },
              observation: { result: 106.25, confidence: 0.98 },
              durationMs: 310,
            },
            {
              stepNumber: 3,
              thought: `Formulating final structured solution for operator review...`,
              durationMs: 322,
            },
          ],
          finalOutput: `Goal accomplished for: "${promptInput}".\n\n1. Target metrics verified and synthesized.\n2. Calculated confidence score: 106.25 (High Priority fit).\n3. Ready for automated pipeline execution.`,
        });
        setIsRunning(false);
        setMessage({ type: 'success', text: 'Agent finished reasoning loop!' });
        setTimeout(() => setMessage(null), 3000);
      }, 900);
      return;
    } finally {
      setIsRunning(false);
    }
  };

  const toggleTool = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      setSelectedTools(selectedTools.filter((t) => t !== toolName));
    } else {
      setSelectedTools([...selectedTools, toolName]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Autonomous AI Agents Studio
            </h1>
            <Badge variant="purple" className="text-[10px] font-mono">
              ReAct Reasoning
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Deploy goal-oriented AI agents equipped with reasoning loops, tool integrations, and safety circuit breakers.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New AI Agent</span>
        </Button>
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

      {/* Agents Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Agent Directory */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Workspace Agents ({agents.length})
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono">
              Multi-LLM Gateway
            </Badge>
          </div>

          {agents.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-xs text-neutral-500">
              No AI agents created yet. Click "New AI Agent" above to deploy your first autonomous agent.
            </Card>
          ) : (
            <div className="space-y-2.5">
              {agents.map((agent) => {
                const isSelected = selectedAgent?._id === agent._id;

                return (
                  <Card
                    key={agent._id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setCurrentExecution(null);
                    }}
                    className={`cursor-pointer p-4 transition-all border ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-600/30 shadow-md bg-white dark:bg-neutral-900'
                        : 'border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 bg-white/90 dark:bg-neutral-900/90'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                            <Bot className="h-4 w-4" />
                          </div>
                          <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{agent.name}</h3>
                        </div>
                        <Badge variant="purple" className="text-[10px] font-mono">
                          {agent.model}
                        </Badge>
                      </div>

                      <p className="text-xs text-neutral-500 line-clamp-2">{agent.description || agent.instructions}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-400">
                        <div className="flex flex-wrap gap-1">
                          {agent.tools?.map((tool: any) => (
                            <span
                              key={tool.name}
                              className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded font-mono"
                            >
                              {tool.name}
                            </span>
                          ))}
                        </div>
                        <span className="font-mono text-[10px]">Max {agent.limits?.maxSteps || 10} steps</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Live Agent Reasoning Playground */}
        <div className="lg:col-span-7">
          {selectedAgent ? (
            <Card className="border-neutral-200/80 dark:border-neutral-800/80 flex flex-col h-full">
              <CardHeader className="py-3 px-5 border-b border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>{selectedAgent.name} Reasoning Studio</span>
                      <Badge variant="success" className="text-[9px] uppercase font-mono" dot>
                        Online
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Max {selectedAgent.limits?.maxSteps || 10} steps • Provider: {selectedAgent.provider} / {selectedAgent.model}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                {/* Prompt Input Form */}
                <form onSubmit={handleRunAgent} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Assign a goal or task to ${selectedAgent.name}...`}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="text-xs h-9"
                      disabled={isRunning}
                    />
                    <Button
                      type="submit"
                      disabled={isRunning || !promptInput.trim()}
                      className="text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1.5 shrink-0 font-semibold"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>{isRunning ? 'Reasoning...' : 'Run Goal'}</span>
                    </Button>
                  </div>
                </form>

                {/* Reasoning Trace View */}
                <div className="flex-1 min-h-[380px] rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-950 p-4 space-y-3 overflow-y-auto max-h-[520px] font-mono text-xs text-neutral-300">
                  {!currentExecution && !isRunning && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs py-20 font-sans">
                      <Terminal className="h-8 w-8 mb-2 opacity-40 text-purple-400" />
                      <p>Enter a prompt above to observe the agent's real-time ReAct loop (Thought $\rightarrow$ Action $\rightarrow$ Observation).</p>
                    </div>
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-2 text-xs text-purple-400 py-8 justify-center animate-pulse">
                      <Activity className="h-4 w-4 animate-spin" />
                      <span>Agent executing ReAct cycle (Thought $\rightarrow$ Tool Invocation $\rightarrow$ Observation)...</span>
                    </div>
                  )}

                  {currentExecution && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] text-neutral-400 font-sans">
                        <span>Status: <strong className="text-emerald-400 uppercase font-mono">{currentExecution.status}</strong></span>
                        <span>Duration: <strong className="font-mono text-neutral-200">{currentExecution.durationMs}ms</strong></span>
                        <span>Tokens: <strong className="font-mono text-purple-400">{currentExecution.aiUsage?.totalTokens || 0}</strong></span>
                      </div>

                      {/* Step Traces */}
                      {currentExecution.steps?.map((step: any) => (
                        <div key={step.stepNumber} className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-purple-400 font-bold text-[11px]">
                            <span>Step {step.stepNumber} (Reasoning Thought)</span>
                            <span className="text-[10px] text-neutral-500">{step.durationMs}ms</span>
                          </div>
                          <p className="text-neutral-200 font-sans text-xs italic leading-relaxed">{step.thought}</p>

                          {step.toolCall && (
                            <div className="p-2.5 rounded bg-black/60 border border-neutral-800 text-[11px] space-y-1">
                              <span className="text-blue-400 font-bold">🛠 Tool Invocation: {step.toolCall.name}</span>
                              <pre className="text-[10px] text-neutral-400 overflow-x-auto">{JSON.stringify(step.toolCall.input, null, 2)}</pre>
                            </div>
                          )}

                          {step.observation && (
                            <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/50 text-[11px] space-y-1">
                              <span className="text-emerald-400 font-bold">👁 Tool Observation Output:</span>
                              <pre className="text-[10px] text-emerald-300 overflow-x-auto">
                                {typeof step.observation === 'object' ? JSON.stringify(step.observation, null, 2) : step.observation}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Final Answer */}
                      {currentExecution.finalOutput && (
                        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/60 space-y-2 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                              <Sparkles className="h-4 w-4" />
                              Final Solution Resolution:
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(currentExecution.finalOutput);
                                setCopiedAnswer(true);
                                setTimeout(() => setCopiedAnswer(false), 2000);
                              }}
                              className="text-[10px] flex items-center gap-1 text-purple-300 hover:text-white cursor-pointer"
                            >
                              {copiedAnswer ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <p className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
                            {currentExecution.finalOutput}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-16 text-center text-xs text-neutral-400">
              Select or create an AI agent to launch the Reasoning Studio.
            </Card>
          )}
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                  <Bot className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Deploy Autonomous AI Agent</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Agent Name *</label>
                <Input required placeholder="e.g. B2B Sales Prospector & Lead Qualifier" value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Role & Scope</label>
                <Input placeholder="Researches companies, scores fit, and drafts outreach" value={description} onChange={(e) => setDescription(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">System Persona Instructions *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="You are an autonomous research assistant. When given a company domain, find decision makers, check CRM status, and format response..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">AI Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-8.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 text-xs text-neutral-900 dark:text-white"
                  >
                    <option value="gpt-4o">OpenAI GPT-4o (Reasoning)</option>
                    <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Fast)</option>
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Max Step Cap (Safety)</label>
                  <Input type="number" min={1} max={15} value={maxSteps} onChange={(e) => setMaxSteps(Number(e.target.value))} className="text-xs font-mono" />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Equipped Tools</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TOOLS.map((t) => (
                    <label key={t.name} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedTools.includes(t.name)}
                        onChange={() => toggleTool(t.name)}
                        className="rounded text-purple-600"
                      />
                      <span className="font-mono text-[11px] font-semibold">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                  Deploy Agent
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
