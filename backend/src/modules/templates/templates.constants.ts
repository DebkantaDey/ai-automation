export interface WorkflowTemplate {
  slug: string;
  name: string;
  category: 'Sales' | 'Support' | 'E-commerce' | 'HR' | 'Operations';
  description: string;
  icon: string;
  triggerType: string;
  nodes: any[];
  edges: any[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    slug: 'lead-qualification-enrichment',
    name: 'AI Lead Qualification & CRM Sync',
    category: 'Sales',
    description: 'Score incoming web leads with AI, create contacts in HubSpot CRM, and route high-value prospects to sales team.',
    icon: 'Zap',
    triggerType: 'webhook',
    nodes: [
      {
        id: 'trigger-lead',
        type: 'trigger',
        label: 'Inbound Web Lead Webhook',
        position: { x: 250, y: 50 },
        data: { triggerType: 'webhook' },
      },
      {
        id: 'ai-lead-score',
        type: 'ai_classify',
        label: 'AI Lead Score & Tiering',
        position: { x: 250, y: 150 },
        data: {
          prompt: 'Evaluate lead potential for: {{steps.trigger-lead.output.company}} with budget {{steps.trigger-lead.output.budget}}',
          categories: ['Enterprise Tier (Score > 80)', 'Growth Tier (Score 50-80)', 'Self-Serve (Score < 50)'],
        },
      },
      {
        id: 'condition-tier',
        type: 'condition_branch',
        label: 'Is Enterprise Tier?',
        position: { x: 250, y: 250 },
        data: {
          matchType: 'all',
          rules: [{ field: '{{steps.ai-lead-score.output.result.category}}', operator: 'contains', value: 'Enterprise' }],
        },
      },
      {
        id: 'action-hubspot',
        type: 'action_hubspot',
        label: 'Create HubSpot Deal',
        position: { x: 150, y: 350 },
        data: {
          action: 'create_contact',
          params: { email: '{{trigger.email}}', firstname: '{{trigger.name}}' },
        },
      },
      {
        id: 'action-slack-alert',
        type: 'action_slack',
        label: 'Alert Sales VIP Channel',
        position: { x: 150, y: 450 },
        data: {
          action: 'send_message',
          params: { text: '🚨 New VIP Enterprise Lead from {{trigger.company}}!' },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger-lead', target: 'ai-lead-score' },
      { id: 'e2', source: 'ai-lead-score', target: 'condition-tier' },
      { id: 'e3', source: 'condition-tier', target: 'action-hubspot' },
      { id: 'e4', source: 'action-hubspot', target: 'action-slack-alert' },
    ],
  },
  {
    slug: 'customer-support-triage',
    name: 'Customer Support Triage & RAG Auto-Draft',
    category: 'Support',
    description: 'Classify incoming customer tickets, search company Knowledge Base, draft AI response, and route for human manager approval.',
    icon: 'MessageSquare',
    triggerType: 'webhook',
    nodes: [
      {
        id: 'trigger-ticket',
        type: 'trigger',
        label: 'Inbound Support Ticket',
        position: { x: 250, y: 50 },
        data: { triggerType: 'webhook' },
      },
      {
        id: 'ai-classify-urgency',
        type: 'ai_classify',
        label: 'Classify Ticket Urgency',
        position: { x: 250, y: 150 },
        data: {
          prompt: '{{trigger.message}}',
          categories: ['Critical Outage', 'Billing Issue', 'General Question'],
        },
      },
      {
        id: 'ai-draft-reply',
        type: 'ai_generate',
        label: 'Draft RAG Knowledge Reply',
        position: { x: 250, y: 250 },
        data: {
          prompt: 'Draft helpful support response for customer issue: {{trigger.message}}',
        },
      },
      {
        id: 'human-approval-gate',
        type: 'human_approval',
        label: 'Agent Review Gate',
        position: { x: 250, y: 350 },
        data: {
          requiredRole: 'Support Lead',
          message: 'Review AI drafted response before sending to customer',
        },
      },
      {
        id: 'send-customer-email',
        type: 'action_gmail',
        label: 'Send Email to Customer',
        position: { x: 250, y: 450 },
        data: {
          action: 'send_email',
          params: { to: '{{trigger.customerEmail}}', subject: 'Re: Support Request #{{trigger.ticketId}}', body: '{{steps.ai-draft-reply.output.content}}' },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger-ticket', target: 'ai-classify-urgency' },
      { id: 'e2', source: 'ai-classify-urgency', target: 'ai-draft-reply' },
      { id: 'e3', source: 'ai-draft-reply', target: 'human-approval-gate' },
      { id: 'e4', source: 'human-approval-gate', target: 'send-customer-email' },
    ],
  },
  {
    slug: 'ecommerce-fulfillment-monitor',
    name: 'E-Commerce Order Verification & Notification',
    category: 'E-commerce',
    description: 'Verify new orders, run AI fraud risk analysis, trigger inventory update, and dispatch customer receipt.',
    icon: 'Building',
    triggerType: 'webhook',
    nodes: [
      {
        id: 'trigger-order',
        type: 'trigger',
        label: 'New Checkout Order',
        position: { x: 250, y: 50 },
        data: { triggerType: 'webhook' },
      },
      {
        id: 'ai-fraud-eval',
        type: 'ai_decision',
        label: 'AI Fraud Risk Analysis',
        position: { x: 250, y: 150 },
        data: {
          prompt: 'Analyze order amount ${{trigger.amount}} with IP {{trigger.ipAddress}}',
        },
      },
      {
        id: 'http-inventory-update',
        type: 'http_request',
        label: 'Update Warehouse ERP',
        position: { x: 250, y: 250 },
        data: {
          method: 'POST',
          url: 'https://erp.internal/api/orders/reserve',
        },
      },
      {
        id: 'notify-customer',
        type: 'action_slack',
        label: 'Notify Discord / Slack',
        position: { x: 250, y: 350 },
        data: {
          action: 'send_message',
          params: { text: '📦 Order #{{trigger.orderId}} verified and fulfillment started.' },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger-order', target: 'ai-fraud-eval' },
      { id: 'e2', source: 'ai-fraud-eval', target: 'http-inventory-update' },
      { id: 'e3', source: 'http-inventory-update', target: 'notify-customer' },
    ],
  },
  {
    slug: 'hr-resume-screening',
    name: 'HR Resume Parsing & Candidate Scoring',
    category: 'HR',
    description: 'Extract candidate skills from resumes, compute AI qualification match score, and ping hiring managers.',
    icon: 'UserCheck',
    triggerType: 'webhook',
    nodes: [
      {
        id: 'trigger-applicant',
        type: 'trigger',
        label: 'New Job Application',
        position: { x: 250, y: 50 },
        data: { triggerType: 'webhook' },
      },
      {
        id: 'ai-extract-skills',
        type: 'ai_extract',
        label: 'Extract Skills & Experience',
        position: { x: 250, y: 150 },
        data: {
          prompt: '{{trigger.resumeText}}',
          fields: ['name', 'yearsExperience', 'techSkills', 'education'],
        },
      },
      {
        id: 'ai-candidate-score',
        type: 'ai_classify',
        label: 'Match Score Evaluation',
        position: { x: 250, y: 250 },
        data: {
          prompt: 'Candidate: {{steps.ai-extract-skills.output.result}} for Senior Software Engineer',
          categories: ['Strong Hire', 'Potential Match', 'Not a Fit'],
        },
      },
      {
        id: 'slack-hiring-channel',
        type: 'action_slack',
        label: 'Post to #hiring-leads',
        position: { x: 250, y: 350 },
        data: {
          action: 'send_message',
          params: { text: 'Candidate {{steps.ai-extract-skills.output.result.name}} scored: {{steps.ai-candidate-score.output.result.category}}' },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger-applicant', target: 'ai-extract-skills' },
      { id: 'e2', source: 'ai-extract-skills', target: 'ai-candidate-score' },
      { id: 'e3', source: 'ai-candidate-score', target: 'slack-hiring-channel' },
    ],
  },
];
