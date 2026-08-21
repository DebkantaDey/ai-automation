import { Injectable, Logger, Optional } from '@nestjs/common';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { IntegrationsService } from '../../integrations/integrations.service';
import { AgentDocument } from '../schemas/agent.schema';
import { AgentExecutionDocument, AgentStepTrace } from '../schemas/agent-execution.schema';
import { ChatMessage } from '../../../integrations/ai/ai.interface';

@Injectable()
export class AgentEngineService {
  private readonly logger = new Logger(AgentEngineService.name);

  constructor(
    private readonly aiGateway: AiGatewayService,
    @Optional() private readonly integrationsService?: IntegrationsService,
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

    const enabledTools = (agent.tools || []).filter((t) => t.enabled);
    const toolsPrompt = enabledTools.length > 0
      ? `You have access to the following tools:\n${enabledTools.map((t) => `- ${t.name}: ${t.description}`).join('\n')}\n`
      : 'You do not have external tools enabled. Answer directly using your instructions.';

    const systemPrompt = `${agent.instructions}\n\n${toolsPrompt}
Respond in valid JSON format ONLY with one of the two structures:
1. If you need to call a tool:
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

        // Check if agent arrived at final response
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

        // Check if agent wants to execute a tool
        if (parsedAction.action && parsedAction.action.tool) {
          toolCallsCount++;

          // Tool calls Circuit Breaker
          if (toolCallsCount > maxToolCalls) {
            throw new Error(`Agent exceeded maximum tool call quota (${toolCallsCount}/${maxToolCalls})`);
          }

          const toolName = parsedAction.action.tool;
          const toolParams = parsedAction.action.params || {};

          let toolObservation: any;
          try {
            toolObservation = await this.executeAgentTool(toolName, toolParams, enabledTools);
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

          // Feed observation back to conversation history
          conversationHistory.push({
            role: 'assistant',
            content: JSON.stringify(parsedAction),
          });
          conversationHistory.push({
            role: 'user',
            content: `Tool [${toolName}] result:\n${JSON.stringify(toolObservation)}`,
          });
        } else {
          // Fallback if neither action nor finalAnswer returned
          execution.finalOutput = parsedAction.thought || cleanedText;
          execution.status = 'completed';
          break;
        }
      }

      if (currentStepNumber >= maxSteps && execution.status !== 'completed') {
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

  private async executeAgentTool(
    toolName: string,
    params: Record<string, any>,
    enabledTools: any[],
  ): Promise<any> {
    const configured = enabledTools.find((t) => t.name === toolName);
    if (!configured && toolName !== 'current_time' && toolName !== 'calculator') {
      throw new Error(`Unauthorized tool execution: Tool [${toolName}] is not enabled for this agent`);
    }

    if (this.integrationsService && configured?.connectionId) {
      return this.integrationsService.executeAction(configured.connectionId, toolName, params);
    }

    // Default built-in tool handlers
    if (toolName === 'current_time') {
      return { timestamp: new Date().toISOString() };
    }

    if (toolName === 'calculator') {
      const expr = String(params.expression || '0');
      // Safe arithmetic evaluator
      if (/^[0-9+\-*/().\s]+$/.test(expr)) {
        return { result: Function(`'use strict'; return (${expr})`)() };
      }
      return { error: 'Invalid arithmetic expression' };
    }

    if (toolName === 'search_knowledge_base') {
      return {
        query: params.query,
        context: `Relevant documentation excerpts for query: "${params.query}" (Similarity: 0.94)`,
      };
    }

    return { result: `Executed tool ${toolName} with parameters: ${JSON.stringify(params)}` };
  }
}
