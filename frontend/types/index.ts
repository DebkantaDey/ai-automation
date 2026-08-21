export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  profileImage?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  status?: string;
  systemRole: string;
  isMfaEnabled?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  logoUrl?: string;
  description?: string;
  industry?: string;
  website?: string;
  status?: string;
  plan: string;
  subscriptionStatus?: string;
  timezone?: string;
  country?: string;
  defaultCurrency?: string;
  role: string;
  memberCount?: number;
  isOwner?: boolean;
  joinedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position?: { x: number; y: number };
  data?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  triggerType: 'manual' | 'webhook' | 'schedule' | 'app_event';
  triggerConfig?: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'paused';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  error?: string;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowExecution {
  _id: string;
  id?: string;
  workflowId: string | { _id: string; name: string };
  triggerType: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
  durationMs: number;
  steps: ExecutionStep[];
  aiUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
  error?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface DashboardMetrics {
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  aiTokensProcessed: number;
  estimatedCost: number;
}
