import { Injectable, Logger, Optional } from '@nestjs/common';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { IntegrationsService } from '../../integrations/integrations.service';
import { AgentToolsRegistry, CONTROLLED_TOOLS_CATALOG } from '../tools/agent-tools.registry';
import { ApprovalsService } from '../services/approvals.service';
import { AgentDocument } from '../schemas/agent.schema';
import { AgentExecutionDocument, AgentStepTrace } from '../schemas/agent-execution.schema';
import { ChatMessage } from '../../../integrations/ai/ai.interface';

@Injectable()
export class AgentEngineService {
  private readonly logger = new Logger(AgentEngineService.name);

  constructor(
    private readonly aiGateway: AiGatewayService,
    @Optional() private readonly integrationsService?: IntegrationsService,
    @Optional() private readonly toolsRegistry?: AgentToolsRegistry,
    @Optional() private readonly approvalsService?: ApprovalsService,
  ) {}

  async runAgentLoop(
    agent: AgentDocument,
    execution: AgentExecutionDocument,
  ): Promise<AgentExecutionDocument> {
    const limits = agent.limits || { maxSteps: 10, maxTokens: 4000, maxToolCalls: 5, timeoutSeconds: 60 };
    const maxSteps = Math.min(15, limits.maxSteps || 10);
    const maxToolCalls = Math.min(10, limits.maxToolCalls || 5);
    const timeoutMs = (limits.timeoutSeconds || 60) * 1000;

    const startTime = Date.now();
    let currentStepNumber = 0;
    let toolCallsCount = 0;

    const agentTools = (agent.tools || []).filter((t) => t.enabled);
    const availableToolsList = agentTools.length > 0
      ? agentTools.map((t) => `- ${t.name}: ${t.description}`).join('\n')
      : CONTROLLED_TOOLS_CATALOG.map((t) => `- ${t.name}: ${t.description}`).join('\n');

    const systemPrompt = `${agent.instructions}

You have access to the following business tools:
${availableToolsList}

Respond in valid JSON format ONLY with one of the two structures:
1. If you need to perform an action/call a tool:
{"thought": "reasoning for next step", "action": {"tool": "tool_name", "params": {"param_key": "param_value"}}}

2. If you are ready to deliver the final response to the user:
{"thought": "conclusion reasoning", "finalAnswer": "your complete answer to the user"}
`;

    const conversationHistory: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: execution.inputPrompt },
    ];

    const stepTraces: AgentStepTrace[] = [];
    const aiUsage = execution.aiUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

    execution.status = 'running';
    await execution.save();

    try {
      while (currentStepNumber < maxSteps) {
        currentStepNumber++;

        // Timeout Circuit Breaker
        if (Date.now() - startTime > timeoutMs) {
          throw new Error(`Agent execution timed out after ${limits.timeoutSeconds}s`);
        }

        const stepStartTime = Date.now();

        const completion = await this.aiGateway.generateChat(conversationHistory, {
          provider: agent.provider as any,
          model: agent.model,
          temperature: 0.2,
          jsonMode: true,
        });

        if (completion.usage) {
          aiUsage.promptTokens += completion.usage.promptTokens || 0;
          aiUsage.completionTokens += completion.usage.completionTokens || 0;
          aiUsage.totalTokens += completion.usage.totalTokens || 0;
          aiUsage.costUsd += completion.usage.totalTokens ? (completion.usage.totalTokens / 1000) * 0.002 : 0;
        }

        // Token Cap Circuit Breaker
        if (limits.maxTokens && aiUsage.totalTokens > limits.maxTokens) {
          throw new Error(`Agent exceeded maximum token limit (${aiUsage.totalTokens}/${limits.maxTokens})`);
        }

        const cleanedText = completion.text.replace(/```json\n?|\n?```/g, '').trim();
        let parsedAction: any;

        try {
          parsedAction = JSON.parse(cleanedText);
        } catch {
          parsedAction = { thought: 'Analysis', finalAnswer: completion.text };
        }

        const thought = parsedAction.thought || 'Processing step';

        // 1. Final answer reached
        if (parsedAction.finalAnswer) {
          stepTraces.push({
            stepNumber: currentStepNumber,
            thought,
            observation: 'Final answer reached.',
            durationMs: Date.now() - stepStartTime,
          });

          execution.finalOutput = parsedAction.finalAnswer;
          execution.status = 'completed';
          break;
        }

        // 2. Action / Tool Execution Requested
        if (parsedAction.action && parsedAction.action.tool) {
          toolCallsCount++;

          if (toolCallsCount > maxToolCalls) {
            throw new Error(`Agent exceeded maximum tool call quota (${toolCallsCount}/${maxToolCalls})`);
          }

          const toolName = parsedAction.action.tool;
          const toolParams = parsedAction.action.params || {};

          // Check if tool requires Human-in-the-Loop Approval Gate
          if (this.toolsRegistry?.isToolSensitive(toolName) && this.approvalsService) {
            const approval = await this.approvalsService.createApproval(
              agent.organizationId.toString(),
              {
                actionType: (toolName as any) || 'custom',
                title: `Approval Required: ${toolName}`,
                reason: thought || `Agent requested sensitive operation: ${toolName}`,
                payload: toolParams,
                agentId: agent._id.toString(),
                executionId: execution._id.toString(),
                requestedByAgentName: agent.name,
              },
              agent.workspaceId?.toString(),
            );

            stepTraces.push({
              stepNumber: currentStepNumber,
              thought,
              toolCall: { name: toolName, input: toolParams },
              observation: {
                status: 'waiting_human_approval',
                approvalId: approval._id,
                message: 'Sensitive operation paused. Awaiting manager approval.',
              },
              durationMs: Date.now() - stepStartTime,
            });

            execution.status = 'waiting_approval' as any;
            execution.finalOutput = `Action paused pending manager approval (Request #${approval._id}).`;
            break;
          }

          let toolObservation: any;
          try {
            if (this.toolsRegistry) {
              toolObservation = await this.toolsRegistry.executeTool(
                agent.organizationId.toString(),
                toolName,
                toolParams,
                agent._id.toString(),
              );
            } else {
              toolObservation = await this.executeFallbackTool(toolName, toolParams, agentTools);
            }
          } catch (toolErr: any) {
            toolObservation = { error: toolErr.message };
          }

          stepTraces.push({
            stepNumber: currentStepNumber,
            thought,
            toolCall: { name: toolName, input: toolParams },
            observation: toolObservation,
            durationMs: Date.now() - stepStartTime,
          });

          // Feed observation back into conversation context
          conversationHistory.push({
            role: 'assistant',
            content: JSON.stringify(parsedAction),
          });
          conversationHistory.push({
            role: 'user',
            content: `Tool [${toolName}] result:\n${JSON.stringify(toolObservation)}`,
          });
        } else {
          execution.finalOutput = parsedAction.thought || cleanedText;
          execution.status = 'completed';
          break;
        }
      }

      if (currentStepNumber >= maxSteps && execution.status !== 'completed' && execution.status !== ('waiting_approval' as any)) {
        execution.status = 'completed';
        execution.finalOutput = execution.finalOutput || 'Agent reached maximum step limit without final conclusion.';
      }

      execution.finishedAt = new Date();
      execution.durationMs = Date.now() - startTime;
      execution.steps = stepTraces;
      execution.aiUsage = aiUsage;
      await execution.save();

      this.logger.log(`Agent execution [${execution._id}] completed in ${execution.durationMs}ms with ${stepTraces.length} steps`);
      return execution;
    } catch (err: any) {
      this.logger.error(`Agent execution [${execution._id}] failed: ${err.message}`);
      execution.status = err.message.includes('timed out') ? 'timeout' : 'failed';
      execution.error = err.message;
      execution.finishedAt = new Date();
      execution.durationMs = Date.now() - startTime;
      execution.steps = stepTraces;
      execution.aiUsage = aiUsage;
      await execution.save();
      return execution;
    }
  }

  private async executeFallbackTool(
    toolName: string,
    params: Record<string, any>,
    enabledTools: any[],
  ): Promise<any> {
    if (toolName === 'current_time') {
      return { timestamp: new Date().toISOString() };
    }
    if (toolName === 'calculator') {
      const expr = String(params.expression || '0');
      if (/^[0-9+\-*/().\s]+$/.test(expr)) {
        return { result: Function(`'use strict'; return (${expr})`)() };
      }
      return { error: 'Invalid arithmetic expression' };
    }
    return { result: `Executed tool ${toolName} with parameters: ${JSON.stringify(params)}` };
  }
}
