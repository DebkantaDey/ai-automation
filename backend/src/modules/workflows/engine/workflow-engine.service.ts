import { Injectable, Logger, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  WorkflowExecution,
  WorkflowExecutionDocument,
  WorkflowStepRun,
  AIUsageStats,
} from '../schemas/workflow-execution.schema';
import { WorkflowNode, WorkflowEdge } from '../schemas/workflow.schema';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { IntegrationsService } from '../../integrations/integrations.service';
import { EventBusService } from '../../../core/events/event-bus.service';

export interface ExecutionContext {
  trigger: Record<string, any>;
  steps: Record<string, { status: string; input?: any; output?: any; error?: string }>;
  env: Record<string, any>;
  item?: any;
  index?: number;
  total?: number;
}

export interface ConditionRule {
  field: string;
  operator: string;
  value: any;
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectModel(WorkflowExecution.name)
    private readonly executionModel: Model<WorkflowExecutionDocument>,
    private readonly aiGateway: AiGatewayService,
    @Optional() private readonly integrationsService?: IntegrationsService,
    @Optional() private readonly eventBus?: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  interpolate(value: any, context: ExecutionContext): any {
    if (typeof value === 'string') {
      return value.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const keys = path.trim().split('.');
        let current: any = context;
        for (const key of keys) {
          if (current === undefined || current === null) return '';
          current = current[key];
        }
        return current !== undefined && current !== null
          ? typeof current === 'object'
            ? JSON.stringify(current)
            : String(current)
          : '';
      });
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.interpolate(item, context));
    }

    if (typeof value === 'object' && value !== null) {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = this.interpolate(v, context);
      }
      return result;
    }

    return value;
  }

  getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of nodes) {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of edges) {
      if (adjList.has(edge.source)) {
        adjList.get(edge.source)!.push(edge.target);
      }
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(nodeId);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);

      for (const v of adjList.get(u) || []) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) queue.push(v);
      }
    }

    return order.length === nodes.length ? order : nodes.map((n) => n.id);
  }

  evaluateCondition(left: any, operator: string, right: any): boolean {
    const leftStr = String(left ?? '').trim().toLowerCase();
    const rightStr = String(right ?? '').trim().toLowerCase();

    switch (operator) {
      case '==':
      case 'equals':
        return leftStr === rightStr;
      case '!=':
      case 'not_equals':
        return leftStr !== rightStr;
      case '>':
      case 'greater_than':
        return parseFloat(left) > parseFloat(right);
      case '<':
      case 'less_than':
        return parseFloat(left) < parseFloat(right);
      case '>=':
        return parseFloat(left) >= parseFloat(right);
      case '<=':
        return parseFloat(left) <= parseFloat(right);
      case 'contains':
        return leftStr.includes(rightStr);
      case 'startsWith':
      case 'starts_with':
        return leftStr.startsWith(rightStr);
      case 'endsWith':
      case 'ends_with':
        return leftStr.endsWith(rightStr);
      case 'regex':
        try {
          return new RegExp(right, 'i').test(String(left ?? ''));
        } catch {
          return false;
        }
      case 'exists':
        return left !== undefined && left !== null && left !== '';
      case 'is_empty':
        return !left || left.length === 0 || Object.keys(left).length === 0;
      case 'is_not_empty':
        return !!left && (typeof left === 'object' ? Object.keys(left).length > 0 : left.length > 0);
      default:
        return Boolean(left);
    }
  }

  async executeNode(
    node: WorkflowNode,
    context: ExecutionContext,
    aiUsage: AIUsageStats,
  ): Promise<{ output: any; status: 'completed' | 'waiting_approval' | 'skipped'; tokenDetails?: ApprovalDetailsPayload }> {
    const data = node.data || {};

    switch (node.type) {
      case 'trigger':
        return {
          output: context.trigger || {},
          status: 'completed',
        };

      case 'http_request': {
        const url = this.interpolate(data.url || '', context);
        const method = (data.method || 'GET').toUpperCase();
        const headers = this.interpolate(data.headers || {}, context);
        const body = data.body ? this.interpolate(data.body, context) : undefined;

        if (!url) {
          throw new BadRequestException(`HTTP node [${node.label || node.id}] missing destination URL`);
        }

        try {
          const response = await axios({
            url,
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            data: body,
            timeout: 30000,
          });

          return {
            output: {
              status: response.status,
              statusText: response.statusText,
              data: response.data,
              headers: response.headers,
            },
            status: 'completed',
          };
        } catch (err: any) {
          const status = err.response?.status || 500;
          const errData = err.response?.data || err.message;
          throw new Error(`HTTP request failed (${status}): ${JSON.stringify(errData)}`);
        }
      }

      case 'condition_branch': {
        const rules: ConditionRule[] = data.rules || [
          {
            field: data.leftOperand,
            operator: data.operator || '==',
            value: data.rightOperand,
          },
        ];

        const matchType = data.matchType || 'all'; // 'all' (AND) | 'any' (OR)
        let matches = matchType === 'all';

        for (const rule of rules) {
          const left = this.interpolate(rule.field, context);
          const right = this.interpolate(rule.value, context);
          const rulePassed = this.evaluateCondition(left, rule.operator, right);

          if (matchType === 'all' && !rulePassed) {
            matches = false;
            break;
          } else if (matchType === 'any' && rulePassed) {
            matches = true;
            break;
          }
        }

        return {
          output: {
            result: matches,
            branch: matches ? 'true' : 'false',
            matchType,
            rulesEvaluated: rules.length,
          },
          status: 'completed',
        };
      }

      case 'loop': {
        const rawItems = this.interpolate(data.items, context);
        let items: any[] = [];

        if (Array.isArray(rawItems)) {
          items = rawItems;
        } else if (typeof rawItems === 'string') {
          try {
            const parsed = JSON.parse(rawItems);
            items = Array.isArray(parsed) ? parsed : [rawItems];
          } catch {
            items = rawItems.split(',').map((s) => s.trim());
          }
        }

        // Enforce maximum iterations to prevent infinite loops (Module 30)
        const maxIterations = Math.min(1000, Math.max(1, parseInt(data.maxIterations || '100', 10)));
        const itemsToProcess = items.slice(0, maxIterations);
        const errorPolicy = data.errorPolicy || 'continue_on_error'; // 'stop_on_error' | 'continue_on_error'

        const processedResults: any[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < itemsToProcess.length; i++) {
          const currentItem = itemsToProcess[i];
          const loopContext: ExecutionContext = {
            ...context,
            item: currentItem,
            index: i,
            total: itemsToProcess.length,
          };

          try {
            if (data.itemTemplate) {
              const res = this.interpolate(data.itemTemplate, loopContext);
              processedResults.push({ index: i, item: currentItem, result: res, status: 'success' });
            } else {
              processedResults.push({ index: i, item: currentItem, status: 'success' });
            }
            successCount++;
          } catch (err: any) {
            errorCount++;
            processedResults.push({ index: i, item: currentItem, error: err.message, status: 'error' });
            if (errorPolicy === 'stop_on_error') {
              break;
            }
          }
        }

        return {
          output: {
            totalItems: items.length,
            iterationsExecuted: itemsToProcess.length,
            successCount,
            errorCount,
            results: processedResults,
          },
          status: 'completed',
        };
      }

      case 'transformer_code': {
        const inputData = this.interpolate(data.input || context.steps, context);
        const template = data.template;

        if (template) {
          const transformed = this.interpolate(template, context);
          return { output: transformed, status: 'completed' };
        }

        return {
          output: inputData,
          status: 'completed',
        };
      }

      case 'ai_generate':
      case 'ai_classify':
      case 'ai_extract':
      case 'ai_summarize':
      case 'ai_decision': {
        let systemPrompt = data.systemPrompt || 'You are an autonomous AI business automation assistant.';
        let userPrompt = this.interpolate(data.prompt || data.userPrompt || '', context);
        const provider = data.provider || 'openai';
        const model = data.model;

        if (node.type === 'ai_classify') {
          const classes = data.categories || ['High', 'Medium', 'Low'];
          systemPrompt = `You are a classifier. Categorize the input into one of: ${JSON.stringify(classes)}. Respond ONLY with valid JSON: {"category": "<selected_category>", "confidence": 0.0-1.0, "reason": "short explanation"}`;
        } else if (node.type === 'ai_extract') {
          const fields = data.fields || ['name', 'email', 'phone', 'summary'];
          systemPrompt = `Extract the following entities: ${JSON.stringify(fields)}. Respond ONLY with valid JSON matching those keys.`;
        } else if (node.type === 'ai_summarize') {
          systemPrompt = 'Summarize the input concisely into 3-5 high-impact bullet points.';
        } else if (node.type === 'ai_decision') {
          systemPrompt = 'Analyze the input and make a business decision. Respond ONLY with valid JSON: {"decision": "APPROVED" | "REJECTED" | "NEEDS_REVIEW", "confidence": 0.0-1.0, "reasoning": "rationale"}';
        }

        if (!userPrompt) {
          userPrompt = JSON.stringify(context.steps);
        }

        const aiResponse = await this.aiGateway.generateChat(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          {
            provider,
            model,
            temperature: data.temperature || 0.3,
          },
        );

        if (aiResponse.usage) {
          aiUsage.promptTokens += aiResponse.usage.promptTokens || 0;
          aiUsage.completionTokens += aiResponse.usage.completionTokens || 0;
          aiUsage.totalTokens += aiResponse.usage.totalTokens || 0;
          aiUsage.costUsd += aiResponse.usage.totalTokens ? (aiResponse.usage.totalTokens / 1000) * 0.002 : 0;
        }

        let parsedOutput: any = aiResponse.text;
        if (node.type === 'ai_classify' || node.type === 'ai_extract' || node.type === 'ai_decision') {
          try {
            parsedOutput = JSON.parse(aiResponse.text.replace(/```json\n?|\n?```/g, '').trim());
          } catch {
            parsedOutput = { rawText: aiResponse.text };
          }
        }

        return {
          output: {
            result: parsedOutput,
            content: aiResponse.text,
            model: aiResponse.model,
            provider: aiResponse.provider,
            usage: aiResponse.usage,
          },
          status: 'completed',
        };
      }

      case 'action_slack':
      case 'action_sheets':
      case 'action_gmail':
      case 'action_hubspot':
      case 'action_discord': {
        if (!this.integrationsService) {
          throw new Error('IntegrationsService is not available');
        }

        const connectionId = data.connectionId;
        const action = data.action || 'execute';
        const params = this.interpolate(data.params || {}, context);

        if (!connectionId) {
          throw new BadRequestException(`Integration step [${node.label || node.id}] requires a selected Connection`);
        }

        const res = await this.integrationsService.executeAction(connectionId, action, params);
        return {
          output: res,
          status: 'completed',
        };
      }

      case 'human_approval': {
        const approvalToken = crypto.randomBytes(24).toString('hex');
        const requiredRole = data.requiredRole || 'Admin';

        return {
          output: {
            approvalToken,
            requiredRole,
            requestedAt: new Date(),
            message: this.interpolate(data.message || 'Workflow execution waiting for manual approval', context),
          },
          status: 'waiting_approval',
          tokenDetails: {
            approvalToken,
            requiredRole,
            nodeId: node.id,
          },
        };
      }

      case 'delay': {
        const durationSeconds = Math.min(60, Math.max(1, parseInt(data.seconds || '1', 10)));
        await new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));
        return {
          output: { delayedSeconds: durationSeconds },
          status: 'completed',
        };
      }

      default:
        return {
          output: this.interpolate(data, context),
          status: 'completed',
        };
    }
  }

  async runWorkflow(
    executionId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    initialPayload: Record<string, any> = {},
    resumeFromNodeId?: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.executionModel.findById(this.toObjectId(executionId));
    if (!execution) {
      throw new NotFoundException(`Execution [${executionId}] not found`);
    }

    const context: ExecutionContext = {
      trigger: initialPayload,
      steps: {},
      env: {},
    };

    for (const step of execution.steps || []) {
      if (step.status === 'completed') {
        context.steps[step.nodeId] = {
          status: step.status,
          input: step.input,
          output: step.output,
        };
      }
    }

    const aiUsage: AIUsageStats = execution.aiUsage || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      costUsd: 0,
    };

    execution.status = 'running';
    if (!execution.startedAt) execution.startedAt = new Date();
    await execution.save();

    if (this.eventBus) {
      await this.eventBus.emit('workflow.started', execution.organizationId.toString(), execution.workspaceId.toString(), {
        executionId: execution._id,
        workflowId: execution.workflowId,
      });
    }

    const nodeOrder = this.getExecutionOrder(nodes, edges);
    let shouldResume = !resumeFromNodeId;

    const nodeMap = new Map<string, WorkflowNode>(nodes.map((n) => [n.id, n]));
    const stepsList: WorkflowStepRun[] = [...(execution.steps || [])];

    try {
      for (const nodeId of nodeOrder) {
        const node = nodeMap.get(nodeId);
        if (!node) continue;

        if (!shouldResume) {
          if (node.id === resumeFromNodeId) {
            shouldResume = true;
            continue;
          }
          continue;
        }

        const existingStep = stepsList.find((s) => s.nodeId === nodeId);
        if (existingStep && existingStep.status === 'completed') {
          continue;
        }

        const stepRun: WorkflowStepRun = {
          nodeId: node.id,
          nodeType: node.type,
          nodeLabel: node.label,
          status: 'running',
          input: this.interpolate(node.data, context),
          startedAt: new Date(),
        };

        const stepIndex = stepsList.findIndex((s) => s.nodeId === nodeId);
        if (stepIndex >= 0) {
          stepsList[stepIndex] = stepRun;
        } else {
          stepsList.push(stepRun);
        }

        execution.steps = stepsList;
        await execution.save();

        const startTime = Date.now();
        const result = await this.executeNode(node, context, aiUsage);
        const duration = Date.now() - startTime;

        stepRun.status = result.status;
        stepRun.output = result.output;
        stepRun.durationMs = duration;
        stepRun.completedAt = new Date();

        context.steps[node.id] = {
          status: result.status,
          input: stepRun.input,
          output: result.output,
        };

        if (result.status === 'waiting_approval') {
          execution.status = 'waiting_approval';
          execution.approvalDetails = {
            nodeId: node.id,
            approvalToken: result.tokenDetails?.approvalToken,
            requiredRole: result.tokenDetails?.requiredRole,
          };
          execution.aiUsage = aiUsage;
          execution.steps = stepsList;
          await execution.save();

          if (this.eventBus) {
            await this.eventBus.emit('workflow.waiting_approval', execution.organizationId.toString(), execution.workspaceId.toString(), {
              executionId: execution._id,
              requiredRole: result.tokenDetails?.requiredRole,
            });
          }

          this.logger.log(`Workflow execution [${execution._id}] paused waiting for approval at [${node.id}]`);
          return execution;
        }
      }

      execution.status = 'completed';
      execution.finishedAt = new Date();
      execution.durationMs = execution.finishedAt.getTime() - execution.startedAt.getTime();
      execution.outputPayload = context.steps;
      execution.aiUsage = aiUsage;
      execution.steps = stepsList;
      await execution.save();

      if (this.eventBus) {
        await this.eventBus.emit('workflow.completed', execution.organizationId.toString(), execution.workspaceId.toString(), {
          executionId: execution._id,
          workflowId: execution.workflowId,
          durationMs: execution.durationMs,
          aiUsage,
        });
      }

      this.logger.log(`Workflow execution [${execution._id}] completed in ${execution.durationMs}ms`);
      return execution;
    } catch (err: any) {
      this.logger.error(`Workflow execution [${execution._id}] failed: ${err.message}`, err.stack);
      execution.status = 'failed';
      execution.error = err.message;
      execution.finishedAt = new Date();
      execution.durationMs = execution.startedAt ? execution.finishedAt.getTime() - execution.startedAt.getTime() : 0;
      execution.steps = stepsList;
      execution.aiUsage = aiUsage;
      await execution.save();

      if (this.eventBus) {
        await this.eventBus.emit('workflow.failed', execution.organizationId.toString(), execution.workspaceId.toString(), {
          executionId: execution._id,
          error: err.message,
        });
      }

      return execution;
    }
  }

  async approveExecution(
    executionId: string,
    actorUserId: string,
    reason?: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.executionModel.findById(this.toObjectId(executionId)).populate('workflowId');
    if (!execution) {
      throw new NotFoundException('Execution record not found');
    }

    if (execution.status !== 'waiting_approval') {
      throw new BadRequestException(`Execution is in status '${execution.status}', not waiting for approval`);
    }

    const pausedNodeId = execution.approvalDetails?.nodeId;

    execution.approvalDetails = {
      ...execution.approvalDetails,
      approvedBy: this.toObjectId(actorUserId),
      actionTakenAt: new Date(),
      reason,
    };

    const workflow = execution.workflowId as any;
    return this.runWorkflow(execution._id.toString(), workflow.nodes, workflow.edges, execution.inputPayload, pausedNodeId);
  }

  async rejectExecution(
    executionId: string,
    actorUserId: string,
    reason?: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.executionModel.findById(this.toObjectId(executionId));
    if (!execution) {
      throw new NotFoundException('Execution record not found');
    }

    if (execution.status !== 'waiting_approval') {
      throw new BadRequestException(`Execution is in status '${execution.status}', not waiting for approval`);
    }

    execution.status = 'cancelled';
    execution.finishedAt = new Date();
    execution.durationMs = execution.startedAt ? execution.finishedAt.getTime() - execution.startedAt.getTime() : 0;
    execution.approvalDetails = {
      ...execution.approvalDetails,
      rejectedBy: this.toObjectId(actorUserId),
      actionTakenAt: new Date(),
      reason: reason || 'Rejected by operator',
    };
    await execution.save();

    return execution;
  }
}

interface ApprovalDetailsPayload {
  approvalToken: string;
  requiredRole: string;
  nodeId: string;
}
