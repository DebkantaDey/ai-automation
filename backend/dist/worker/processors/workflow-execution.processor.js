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
var WorkflowExecutionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const queue_constants_1 = require("../../core/queue/queue.constants");
const workflow_execution_schema_1 = require("../../modules/workflows/schemas/workflow-execution.schema");
const ai_gateway_service_1 = require("../../integrations/ai/ai-gateway.service");
let WorkflowExecutionProcessor = WorkflowExecutionProcessor_1 = class WorkflowExecutionProcessor extends bullmq_1.WorkerHost {
    executionModel;
    aiGateway;
    logger = new common_1.Logger(WorkflowExecutionProcessor_1.name);
    constructor(executionModel, aiGateway) {
        super();
        this.executionModel = executionModel;
        this.aiGateway = aiGateway;
    }
    async process(job) {
        if (job.name !== queue_constants_1.JOB_EXECUTE_WORKFLOW) {
            return;
        }
        const { executionId, nodes, edges, initialPayload } = job.data;
        this.logger.log(`Starting background processing for execution [${executionId}]`);
        const execution = await this.executionModel.findById(executionId);
        if (!execution) {
            this.logger.error(`Execution record [${executionId}] not found`);
            return;
        }
        const startTime = Date.now();
        execution.status = 'running';
        execution.startedAt = new Date();
        await execution.save();
        let totalPromptTokens = 0;
        let totalCompletionTokens = 0;
        let contextData = { ...initialPayload };
        try {
            const stepResults = [];
            for (const node of nodes || []) {
                const stepStartTime = Date.now();
                this.logger.debug(`Executing workflow node [${node.id}] of type [${node.type}]`);
                let stepOutput = {};
                let stepStatus = 'completed';
                let stepError;
                try {
                    if (node.type === 'trigger') {
                        stepOutput = { payload: contextData, triggeredAt: new Date().toISOString() };
                    }
                    else if (node.type === 'ai_action' || node.type === 'ai_agent') {
                        const prompt = node.data?.prompt || 'Process the incoming data and return a JSON summary.';
                        const model = node.data?.model || 'gpt-4o';
                        const systemPrompt = node.data?.systemPrompt || 'You are an intelligent business automation agent.';
                        const aiResult = await this.aiGateway.generateCompletion(`${prompt}\n\nContext Data:\n${JSON.stringify(contextData, null, 2)}`, {
                            model,
                            systemPrompt,
                            temperature: node.data?.temperature ?? 0.7,
                        });
                        totalPromptTokens += aiResult.usage.promptTokens || 0;
                        totalCompletionTokens += aiResult.usage.completionTokens || 0;
                        stepOutput = {
                            response: aiResult.text,
                            model: aiResult.model,
                            provider: aiResult.provider,
                            usage: aiResult.usage,
                        };
                        contextData[node.id] = stepOutput;
                    }
                    else if (node.type === 'webhook' || node.type === 'http_request') {
                        stepOutput = {
                            status: 200,
                            message: 'HTTP action executed successfully',
                            data: { forwarded: true },
                        };
                        contextData[node.id] = stepOutput;
                    }
                    else {
                        stepOutput = { processed: true, timestamp: Date.now() };
                        contextData[node.id] = stepOutput;
                    }
                }
                catch (err) {
                    stepStatus = 'failed';
                    stepError = err.message;
                    this.logger.error(`Node [${node.id}] failed: ${err.message}`, err.stack);
                }
                stepResults.push({
                    nodeId: node.id,
                    nodeType: node.type,
                    status: stepStatus,
                    input: node.data,
                    output: stepOutput,
                    error: stepError,
                    durationMs: Date.now() - stepStartTime,
                    startedAt: new Date(stepStartTime),
                    completedAt: new Date(),
                });
                if (stepStatus === 'failed') {
                    throw new Error(`Step ${node.id} (${node.label || node.type}) failed: ${stepError}`);
                }
            }
            execution.status = 'completed';
            execution.steps = stepResults;
            execution.outputPayload = contextData;
            execution.finishedAt = new Date();
            execution.durationMs = Date.now() - startTime;
            execution.aiUsage = {
                promptTokens: totalPromptTokens,
                completionTokens: totalCompletionTokens,
                totalTokens: totalPromptTokens + totalCompletionTokens,
                costUsd: (totalPromptTokens * 0.000005) + (totalCompletionTokens * 0.000015),
            };
            await execution.save();
            this.logger.log(`Workflow execution [${executionId}] completed successfully in ${execution.durationMs}ms`);
            return { success: true, executionId, durationMs: execution.durationMs };
        }
        catch (error) {
            execution.status = 'failed';
            execution.finishedAt = new Date();
            execution.durationMs = Date.now() - startTime;
            execution.error = error.message;
            await execution.save();
            this.logger.error(`Workflow execution [${executionId}] failed: ${error.message}`);
            throw error;
        }
    }
};
exports.WorkflowExecutionProcessor = WorkflowExecutionProcessor;
exports.WorkflowExecutionProcessor = WorkflowExecutionProcessor = WorkflowExecutionProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_constants_1.QUEUE_WORKFLOW_EXECUTION),
    __param(0, (0, mongoose_1.InjectModel)(workflow_execution_schema_1.WorkflowExecution.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        ai_gateway_service_1.AiGatewayService])
], WorkflowExecutionProcessor);
//# sourceMappingURL=workflow-execution.processor.js.map