"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AgentEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentEngineService = void 0;
const common_1 = require("@nestjs/common");
const ai_gateway_service_1 = require("../../../integrations/ai/ai-gateway.service");
const integrations_service_1 = require("../../integrations/integrations.service");
let AgentEngineService = AgentEngineService_1 = class AgentEngineService {
    aiGateway;
    integrationsService;
    logger = new common_1.Logger(AgentEngineService_1.name);
    constructor(aiGateway, integrationsService) {
        this.aiGateway = aiGateway;
        this.integrationsService = integrationsService;
    }
    async runAgentLoop(agent, execution) {
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
        const conversationHistory = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: execution.inputPrompt },
        ];
        const stepTraces = [];
        const aiUsage = execution.aiUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };
        execution.status = 'running';
        await execution.save();
        try {
            while (currentStepNumber < maxSteps) {
                currentStepNumber++;
                if (Date.now() - startTime > timeoutMs) {
                    throw new Error(`Agent execution timed out after ${limits.timeoutSeconds}s`);
                }
                const stepStartTime = Date.now();
                const completion = await this.aiGateway.generateChat(conversationHistory, {
                    provider: agent.provider,
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
                if (limits.maxTokens && aiUsage.totalTokens > limits.maxTokens) {
                    throw new Error(`Agent exceeded maximum token limit (${aiUsage.totalTokens}/${limits.maxTokens})`);
                }
                const cleanedText = completion.text.replace(/```json\n?|\n?```/g, '').trim();
                let parsedAction;
                try {
                    parsedAction = JSON.parse(cleanedText);
                }
                catch {
                    parsedAction = { thought: 'Analysis', finalAnswer: completion.text };
                }
                const thought = parsedAction.thought || 'Processing step';
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
                if (parsedAction.action && parsedAction.action.tool) {
                    toolCallsCount++;
                    if (toolCallsCount > maxToolCalls) {
                        throw new Error(`Agent exceeded maximum tool call quota (${toolCallsCount}/${maxToolCalls})`);
                    }
                    const toolName = parsedAction.action.tool;
                    const toolParams = parsedAction.action.params || {};
                    let toolObservation;
                    try {
                        toolObservation = await this.executeAgentTool(toolName, toolParams, enabledTools);
                    }
                    catch (toolErr) {
                        toolObservation = { error: toolErr.message };
                    }
                    stepTraces.push({
                        stepNumber: currentStepNumber,
                        thought,
                        toolCall: { name: toolName, input: toolParams },
                        observation: toolObservation,
                        durationMs: Date.now() - stepStartTime,
                    });
                    conversationHistory.push({
                        role: 'assistant',
                        content: JSON.stringify(parsedAction),
                    });
                    conversationHistory.push({
                        role: 'user',
                        content: `Tool [${toolName}] result:\n${JSON.stringify(toolObservation)}`,
                    });
                }
                else {
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
        }
        catch (err) {
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
    async executeAgentTool(toolName, params, enabledTools) {
        const configured = enabledTools.find((t) => t.name === toolName);
        if (!configured && toolName !== 'current_time' && toolName !== 'calculator') {
            throw new Error(`Unauthorized tool execution: Tool [${toolName}] is not enabled for this agent`);
        }
        if (this.integrationsService && configured?.connectionId) {
            return this.integrationsService.executeAction(configured.connectionId, toolName, params);
        }
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
        if (toolName === 'search_knowledge_base') {
            return {
                query: params.query,
                context: `Relevant documentation excerpts for query: "${params.query}" (Similarity: 0.94)`,
            };
        }
        return { result: `Executed tool ${toolName} with parameters: ${JSON.stringify(params)}` };
    }
};
exports.AgentEngineService = AgentEngineService;
exports.AgentEngineService = AgentEngineService = AgentEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [ai_gateway_service_1.AiGatewayService,
        integrations_service_1.IntegrationsService])
], AgentEngineService);
//# sourceMappingURL=agent-engine.service.js.map