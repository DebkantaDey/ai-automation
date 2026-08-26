import { Test, TestingModule } from '@nestjs/testing';
import { AgentEngineService } from '../engine/agent-engine.service';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { AgentToolsRegistry } from '../tools/agent-tools.registry';
import { ApprovalsService } from '../services/approvals.service';

describe('AgentEngineService ReAct Loop', () => {
  let service: AgentEngineService;
  let mockAiGateway: any;
  let mockToolsRegistry: any;
  let mockApprovalsService: any;

  beforeEach(async () => {
    mockAiGateway = {
      generateChat: jest
        .fn()
        .mockResolvedValueOnce({
          text: JSON.stringify({
            thought: 'Need to look up customer profile in CRM',
            action: { tool: 'lookup_customer', params: { query: 'David Vance' } },
          }),
          usage: { promptTokens: 100, completionTokens: 40, totalTokens: 140 },
        })
        .mockResolvedValueOnce({
          text: JSON.stringify({
            thought: 'Customer identified, answering question',
            finalAnswer: 'David Vance from Global Logistics has an active Enterprise tier subscription.',
          }),
          usage: { promptTokens: 80, completionTokens: 30, totalTokens: 110 },
        }),
    };

    mockToolsRegistry = {
      isToolSensitive: jest.fn().mockReturnValue(false),
      executeTool: jest.fn().mockResolvedValue({
        found: true,
        customer: { name: 'David Vance', company: 'Global Logistics Corp', tier: 'enterprise' },
      }),
    };

    mockApprovalsService = {
      createApproval: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentEngineService,
        { provide: AiGatewayService, useValue: mockAiGateway },
        { provide: AgentToolsRegistry, useValue: mockToolsRegistry },
        { provide: ApprovalsService, useValue: mockApprovalsService },
      ],
    }).compile();

    service = module.get<AgentEngineService>(AgentEngineService);
  });

  it('should run multi-step ReAct loop (Thought -> Action -> Observation -> Final Answer)', async () => {
    const mockAgent: any = {
      _id: 'agent-123',
      organizationId: 'org-1',
      workspaceId: 'ws-1',
      name: 'Sales Support AI',
      instructions: 'Assist customer with account inquiries',
      provider: 'openai',
      model: 'gpt-4o',
      tools: [{ name: 'lookup_customer', description: 'Search CRM', enabled: true }],
      limits: { maxSteps: 5, maxTokens: 4000, maxToolCalls: 3, timeoutSeconds: 30 },
    };

    const mockExecution: any = {
      _id: 'exec-123',
      inputPrompt: 'What tier is David Vance on?',
      status: 'pending',
      aiUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
      save: jest.fn().mockResolvedValue(true),
    };

    const result = await service.runAgentLoop(mockAgent, mockExecution);

    expect(result.status).toBe('completed');
    expect(result.finalOutput).toContain('David Vance from Global Logistics');
    expect(result.steps.length).toBe(2);
    expect(mockToolsRegistry.executeTool).toHaveBeenCalledWith(
      'org-1',
      'lookup_customer',
      { query: 'David Vance' },
      'agent-123',
    );
  });
});
