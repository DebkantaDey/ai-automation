import { AgentEngineService } from '../engine/agent-engine.service';
import { AgentsService } from '../agents.service';

describe('Autonomous AI Agent Framework & ReAct Execution Loop', () => {
  let agentEngine: AgentEngineService;
  let agentsService: AgentsService;
  let mockAiGateway: any;
  let mockAgentModel: any;
  let mockExecutionModel: any;
  let mockUsageService: any;

  beforeEach(() => {
    mockAiGateway = {
      generateChat: jest.fn(),
    };

    mockAgentModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'agent-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockAgentModel.find = jest.fn();
    mockAgentModel.findOne = jest.fn();
    mockAgentModel.findOneAndUpdate = jest.fn();
    mockAgentModel.deleteOne = jest.fn();

    mockExecutionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'exec-agent-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockExecutionModel.find = jest.fn();
    mockExecutionModel.findOne = jest.fn();

    mockUsageService = {
      checkLimit: jest.fn().mockResolvedValue(undefined),
      recordAIUsage: jest.fn().mockResolvedValue(undefined),
    };

    agentEngine = new AgentEngineService(mockAiGateway as any, undefined);
    agentsService = new AgentsService(
      mockAgentModel as any,
      mockExecutionModel as any,
      agentEngine,
      mockUsageService,
    );
  });

  describe('1. ReAct Execution Loop (Thought -> Tool Action -> Observation -> Final Answer)', () => {
    it('should execute tool and provide final answer when agent finishes reasoning', async () => {
      const mockAgent: any = {
        _id: 'agent-1',
        name: 'Math & Time Assistant',
        instructions: 'Calculate results and report date',
        provider: 'openai',
        model: 'gpt-4o',
        tools: [
          { name: 'calculator', description: 'Calculates math', enabled: true },
          { name: 'current_time', description: 'Gets timestamp', enabled: true },
        ],
        limits: { maxSteps: 5, maxTokens: 4000, maxToolCalls: 3, timeoutSeconds: 30 },
      };

      const mockExecution: any = {
        _id: 'exec-1',
        inputPrompt: 'What is 15 * 40?',
        aiUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
        save: jest.fn().mockResolvedValue(true),
      };

      // Step 1: Agent decides to use calculator tool
      mockAiGateway.generateChat
        .mockResolvedValueOnce({
          text: JSON.stringify({
            thought: 'I need to multiply 15 by 40 using calculator',
            action: { tool: 'calculator', params: { expression: '15 * 40' } },
          }),
          usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        })
        // Step 2: Agent receives observation 600 and returns final answer
        .mockResolvedValueOnce({
          text: JSON.stringify({
            thought: 'The calculation returned 600, I will now answer the user',
            finalAnswer: '15 multiplied by 40 equals 600.',
          }),
          usage: { promptTokens: 100, completionTokens: 40, totalTokens: 140 },
        });

      const res = await agentEngine.runAgentLoop(mockAgent, mockExecution);

      expect(res.status).toBe('completed');
      expect(res.finalOutput).toBe('15 multiplied by 40 equals 600.');
      expect(res.steps).toHaveLength(2);
      expect(res.steps[0].toolCall?.name).toBe('calculator');
      expect(res.steps[0].observation).toEqual({ result: 600 });
      expect(res.aiUsage.totalTokens).toBe(220);
    });
  });

  describe('2. Safety Circuit Breakers (Module 40)', () => {
    it('should halt execution when maxSteps limit is reached to prevent runaway loops', async () => {
      const mockAgent: any = {
        _id: 'agent-runaway',
        name: 'Looping Agent',
        instructions: 'Keep thinking forever',
        provider: 'openai',
        model: 'gpt-4o',
        tools: [{ name: 'calculator', description: 'Calculates math', enabled: true }],
        limits: { maxSteps: 3, maxTokens: 4000, maxToolCalls: 5, timeoutSeconds: 30 },
      };

      const mockExecution: any = {
        _id: 'exec-2',
        inputPrompt: 'Do loop',
        aiUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
        save: jest.fn().mockResolvedValue(true),
      };

      // Simulates agent stuck in reasoning loop
      mockAiGateway.generateChat.mockResolvedValue({
        text: JSON.stringify({
          thought: 'Still calculating next step...',
          action: { tool: 'calculator', params: { expression: '1 + 1' } },
        }),
        usage: { promptTokens: 30, completionTokens: 20, totalTokens: 50 },
      });

      const res = await agentEngine.runAgentLoop(mockAgent, mockExecution);

      expect(res.steps.length).toBeLessThanOrEqual(3);
      expect(res.status).toBe('completed');
      expect(res.finalOutput).toBeDefined();
    });
  });
});
