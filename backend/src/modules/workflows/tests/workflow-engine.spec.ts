import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkflowEngineService } from '../engine/workflow-engine.service';
import { WorkflowsService } from '../workflows.service';
import { WorkflowNode, WorkflowEdge } from '../schemas/workflow.schema';

describe('Workflow DAG Engine, Safe Loops, Multi-Branching & Version History', () => {
  let engineService: WorkflowEngineService;
  let workflowsService: WorkflowsService;

  let mockExecutionModel: any;
  let mockWorkflowModel: any;
  let mockVersionModel: any;
  let mockQueue: any;
  let mockAiGateway: any;
  let mockEventBus: any;
  let mockSubscriptionAccess: any;

  beforeEach(() => {
    mockExecutionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'exec-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockExecutionModel.findById = jest.fn();
    mockExecutionModel.findOne = jest.fn();
    mockExecutionModel.find = jest.fn();
    mockExecutionModel.countDocuments = jest.fn();

    mockWorkflowModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'wf-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockWorkflowModel.findById = jest.fn();
    mockWorkflowModel.findOne = jest.fn();
    mockWorkflowModel.find = jest.fn();
    mockWorkflowModel.countDocuments = jest.fn().mockResolvedValue(1);
    mockWorkflowModel.findOneAndUpdate = jest.fn();

    mockVersionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'ver-1' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockVersionModel.find = jest.fn();
    mockVersionModel.findOne = jest.fn();

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    mockAiGateway = {
      generateChat: jest.fn().mockResolvedValue({
        text: JSON.stringify({ category: 'High', confidence: 0.95, reason: 'VIP Customer' }),
        provider: 'openai',
        model: 'gpt-4o',
        usage: { promptTokens: 40, completionTokens: 60, totalTokens: 100 },
      }),
    };

    mockEventBus = {
      emit: jest.fn().mockResolvedValue(undefined),
    };

    mockSubscriptionAccess = {
      canCreateWorkflow: jest.fn().mockResolvedValue(true),
      canExecuteWorkflow: jest.fn().mockResolvedValue(true),
    };

    engineService = new WorkflowEngineService(
      mockExecutionModel as any,
      mockAiGateway as any,
      undefined,
      mockEventBus as any,
    );

    workflowsService = new WorkflowsService(
      mockWorkflowModel as any,
      mockVersionModel as any,
      mockExecutionModel as any,
      mockQueue as any,
      engineService,
      mockSubscriptionAccess,
    );
  });

  describe('1. Topological Sort & DAG Dependency Resolution', () => {
    it('should compute correct linear topological execution order', () => {
      const nodes: WorkflowNode[] = [
        { id: 'node-c', type: 'http_request', label: 'HTTP' },
        { id: 'node-a', type: 'trigger', label: 'Trigger' },
        { id: 'node-b', type: 'transformer_code', label: 'Transform' },
      ];

      const edges: WorkflowEdge[] = [
        { id: 'e1', source: 'node-a', target: 'node-b' },
        { id: 'e2', source: 'node-b', target: 'node-c' },
      ];

      const order = engineService.getExecutionOrder(nodes, edges);
      expect(order).toEqual(['node-a', 'node-b', 'node-c']);
    });
  });

  describe('2. Multi-Rule Condition Evaluator (Module 29)', () => {
    it('should evaluate complex multi-rule AND conditions (startsWith, greater_than)', async () => {
      const conditionNode: WorkflowNode = {
        id: 'cond-multi-1',
        type: 'condition_branch',
        label: 'Validate VIP Lead',
        data: {
          matchType: 'all',
          rules: [
            { field: '{{trigger.email}}', operator: 'endsWith', value: '@enterprise.com' },
            { field: '{{trigger.score}}', operator: '>', value: '80' },
          ],
        },
      };

      const context: any = { trigger: { email: 'ceo@enterprise.com', score: 95 }, steps: {} };
      const aiUsage: any = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

      const res = await engineService.executeNode(conditionNode, context, aiUsage);
      expect(res.output.result).toBe(true);
      expect(res.output.branch).toBe('true');
    });

    it('should evaluate regex patterns correctly', () => {
      const isEmail = engineService.evaluateCondition('support@company.org', 'regex', '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$');
      expect(isEmail).toBe(true);
    });
  });

  describe('3. Safe Loop Engine & Infinite Loop Prevention (Module 30)', () => {
    it('should iterate over dynamic array items and return accumulated results', async () => {
      const loopNode: WorkflowNode = {
        id: 'loop-1',
        type: 'loop',
        label: 'Process Leads',
        data: {
          items: ['Alice', 'Bob', 'Charlie'],
          itemTemplate: 'Processed: {{item}} (#{{index}} of {{total}})',
          maxIterations: 50,
        },
      };

      const context: any = { trigger: {}, steps: {} };
      const aiUsage: any = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

      const res = await engineService.executeNode(loopNode, context, aiUsage);

      expect(res.output.iterationsExecuted).toBe(3);
      expect(res.output.successCount).toBe(3);
      expect(res.output.results[0].result).toBe('Processed: Alice (#0 of 3)');
      expect(res.output.results[2].result).toBe('Processed: Charlie (#2 of 3)');
    });

    it('should strictly cap iterations at maxIterations to prevent infinite loops', async () => {
      const largeArray = Array.from({ length: 500 }, (_, i) => `item_${i}`);
      const loopNode: WorkflowNode = {
        id: 'loop-capped',
        type: 'loop',
        label: 'Large Array',
        data: {
          items: largeArray,
          maxIterations: 10,
        },
      };

      const context: any = { trigger: {}, steps: {} };
      const aiUsage: any = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

      const res = await engineService.executeNode(loopNode, context, aiUsage);
      expect(res.output.iterationsExecuted).toBe(10);
    });
  });

  describe('4. AI Specialists (Classification & Decision)', () => {
    it('should execute ai_classify node and parse structured output', async () => {
      const classifyNode: WorkflowNode = {
        id: 'ai-class-1',
        type: 'ai_classify',
        label: 'Classify Urgency',
        data: {
          prompt: 'My server is down and production is failing!',
          categories: ['Critical', 'Normal', 'Low'],
        },
      };

      const context: any = { trigger: {}, steps: {} };
      const aiUsage: any = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

      const res = await engineService.executeNode(classifyNode, context, aiUsage);
      expect(res.output.result.category).toBe('High');
      expect(mockAiGateway.generateChat).toHaveBeenCalled();
    });
  });

  describe('5. Version Rollback & Workflow Duplication (Module 26)', () => {
    it('should rollback workflow draft graph to historical version snapshot', async () => {
      const historicalVersion = {
        version: 1,
        nodes: [{ id: 'v1-trigger', type: 'trigger', label: 'V1 Trigger' }],
        edges: [],
        triggerConfig: { interval: 'hourly' },
        settings: { maxRetries: 2 },
      };
      mockVersionModel.findOne.mockResolvedValue(historicalVersion);
      mockWorkflowModel.findOneAndUpdate.mockResolvedValue({ _id: 'wf-1', ...historicalVersion });

      const rolledBack = await workflowsService.rollbackVersion('wf-1', 1, 'org-1', 'ws-1', 'user-1');

      expect(mockVersionModel.findOne).toHaveBeenCalledWith({
        workflowId: expect.anything(),
        version: 1,
        organizationId: expect.anything(),
        workspaceId: expect.anything(),
      });
      expect(rolledBack).toBeDefined();
    });

    it('should duplicate an existing workflow as a fresh draft', async () => {
      const sourceWf = {
        _id: 'wf-source-1',
        name: 'Lead Router',
        description: 'Original description',
        triggerType: 'manual',
        nodes: [{ id: 'n1', type: 'trigger', label: 'Trigger' }],
        edges: [],
      };
      mockWorkflowModel.findOne.mockResolvedValue(sourceWf);

      const duplicated = await workflowsService.duplicate('wf-source-1', 'org-1', 'ws-1', 'user-1', 'Lead Router (Clone)');

      expect(duplicated.name).toBe('Lead Router (Clone)');
      expect(duplicated.status).toBe('draft');
      expect(duplicated.isPublished).toBe(false);
    });
  });
});
