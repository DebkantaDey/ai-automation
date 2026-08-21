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

export default function AgentsManagementPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);

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

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/agents');
      const data = res.data?.data || res.data || [];
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load AI agents' });
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

      await apiClient.post('/agents', {
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
      });

      setMessage({ type: 'success', text: 'AI Agent created successfully!' });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setInstructions('');
      await loadAgents();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create agent' });
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Agent execution failed' });
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
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Autonomous AI Agents
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Deploy goal-oriented AI agents equipped with reasoning loops, tool integrations, and safety circuit breakers.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Workspace Agents ({agents.length})
          </h2>

          {agents.length === 0 ? (
            <Card className="border-dashed p-6 text-center text-xs text-neutral-500">
              No AI agents created. Click "New AI Agent" above to deploy your first autonomous agent.
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
                        ? 'border-purple-600 ring-2 ring-purple-600/30 bg-purple-50/20 dark:bg-purple-950/20'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                            <Bot className="h-4 w-4" />
                          </div>
                          <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{agent.name}</h3>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono uppercase">
                          {agent.model}
                        </Badge>
                      </div>

                      <p className="text-xs text-neutral-500 line-clamp-2">{agent.description || agent.instructions}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {agent.tools?.map((tool: any) => (
                          <span
                            key={tool.name}
                            className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded font-mono"
                          >
                            {tool.name}
                          </span>
                        ))}
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
            <Card className="border-neutral-200 dark:border-neutral-800 flex flex-col h-full">
              <CardHeader className="py-3 px-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>{selectedAgent.name} Playground</span>
                      <Badge variant="success" className="text-[9px] uppercase font-mono">
                        Active
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Max {selectedAgent.limits?.maxSteps || 10} steps • {selectedAgent.provider}/{selectedAgent.model}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                {/* Prompt Input */}
                <form onSubmit={handleRunAgent} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Assign a goal or task to ${selectedAgent.name}...`}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="text-xs"
                      disabled={isRunning}
                    />
                    <Button
                      type="submit"
                      disabled={isRunning || !promptInput.trim()}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>{isRunning ? 'Reasoning...' : 'Run Goal'}</span>
                    </Button>
                  </div>
                </form>

                {/* Reasoning Traces View */}
                <div className="flex-1 min-h-[350px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-3 space-y-3 overflow-y-auto max-h-[500px]">
                  {!currentExecution && !isRunning && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs py-16">
                      <Terminal className="h-8 w-8 mb-2 opacity-40" />
                      <p>Enter a task prompt above to observe the ReAct reasoning steps and tool calls in real time.</p>
                    </div>
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 py-6 justify-center animate-pulse font-mono">
                      <Activity className="h-4 w-4 animate-spin" />
                      <span>Agent executing ReAct cycle (Thought $\rightarrow$ Action $\rightarrow$ Observation)...</span>
                    </div>
                  )}

                  {currentExecution && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 text-[11px] text-neutral-500">
                        <span>Status: <strong className="text-emerald-600 uppercase font-mono">{currentExecution.status}</strong></span>
                        <span>Duration: <strong>{currentExecution.durationMs}ms</strong></span>
                        <span>Tokens: <strong>{currentExecution.aiUsage?.totalTokens || 0}</strong></span>
                      </div>

                      {/* Steps */}
                      {currentExecution.steps?.map((step: any) => (
                        <div key={step.stepNumber} className="p-3 rounded-lg bg-white dark:bg-neutral-900 border text-xs space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-purple-600 font-bold font-mono text-[11px]">
                            <span>Step {step.stepNumber} (Reasoning Thought)</span>
                            <span className="text-[10px] text-neutral-400">{step.durationMs}ms</span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300 italic">{step.thought}</p>

                          {step.toolCall && (
                            <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] space-y-1">
                              <span className="text-blue-600 dark:text-blue-400 font-bold">🛠 Tool Action: {step.toolCall.name}</span>
                              <pre className="text-[10px] text-neutral-500 overflow-x-auto">{JSON.stringify(step.toolCall.input, null, 2)}</pre>
                            </div>
                          )}

                          {step.observation && (
                            <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 font-mono text-[11px] space-y-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">👁 Observation Result:</span>
                              <pre className="text-[10px] text-neutral-600 dark:text-neutral-300 overflow-x-auto">
                                {typeof step.observation === 'object' ? JSON.stringify(step.observation, null, 2) : step.observation}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Final Answer */}
                      {currentExecution.finalOutput && (
                        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            Final Agent Resolution:
                          </span>
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
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
            <Card className="p-12 text-center text-xs text-neutral-400">
              Select or create an agent to launch the playground.
            </Card>
          )}
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create Autonomous AI Agent</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Agent Name</label>
                <Input required placeholder="e.g. Sales Research & Qualification Agent" value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Description</label>
                <Input placeholder="Automates customer outreach and lead research" value={description} onChange={(e) => setDescription(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">System Instructions & Persona</label>
                <textarea
                  required
                  rows={4}
                  placeholder="You are an autonomous B2B researcher. When given a lead, verify company data, calculate score, and draft an introductory email..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">AI Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 text-xs"
                  >
                    <option value="gpt-4o">OpenAI GPT-4o (Reasoning)</option>
                    <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Fast)</option>
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Max Steps (Circuit Breaker)</label>
                  <Input type="number" min={1} max={15} value={maxSteps} onChange={(e) => setMaxSteps(Number(e.target.value))} className="text-xs font-mono" />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Equipped Tools</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TOOLS.map((t) => (
                    <label key={t.name} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer p-2 rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900">
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

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
                  {isSubmitting ? 'Creating Agent...' : 'Deploy Agent'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
