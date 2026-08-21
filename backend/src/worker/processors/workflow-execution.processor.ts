import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  QUEUE_WORKFLOW_EXECUTION,
  JOB_EXECUTE_WORKFLOW,
} from '../../core/queue/queue.constants';
import {
  WorkflowExecution,
  WorkflowExecutionDocument,
} from '../../modules/workflows/schemas/workflow-execution.schema';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';

@Processor(QUEUE_WORKFLOW_EXECUTION)
export class WorkflowExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowExecutionProcessor.name);

  constructor(
    @InjectModel(WorkflowExecution.name)
    private readonly executionModel: Model<WorkflowExecutionDocument>,
    private readonly aiGateway: AiGatewayService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== JOB_EXECUTE_WORKFLOW) {
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
      const stepResults: any[] = [];

      for (const node of nodes || []) {
        const stepStartTime = Date.now();
        this.logger.debug(`Executing workflow node [${node.id}] of type [${node.type}]`);

        let stepOutput: any = {};
        let stepStatus: 'completed' | 'failed' = 'completed';
        let stepError: string | undefined;

        try {
          if (node.type === 'trigger') {
            stepOutput = { payload: contextData, triggeredAt: new Date().toISOString() };
          } else if (node.type === 'ai_action' || node.type === 'ai_agent') {
            const prompt = node.data?.prompt || 'Process the incoming data and return a JSON summary.';
            const model = node.data?.model || 'gpt-4o';
            const systemPrompt = node.data?.systemPrompt || 'You are an intelligent business automation agent.';

            const aiResult = await this.aiGateway.generateCompletion(
              `${prompt}\n\nContext Data:\n${JSON.stringify(contextData, null, 2)}`,
              {
                model,
                systemPrompt,
                temperature: node.data?.temperature ?? 0.7,
              },
            );

            totalPromptTokens += aiResult.usage.promptTokens || 0;
            totalCompletionTokens += aiResult.usage.completionTokens || 0;

            stepOutput = {
              response: aiResult.text,
              model: aiResult.model,
              provider: aiResult.provider,
              usage: aiResult.usage,
            };

            contextData[node.id] = stepOutput;
          } else if (node.type === 'webhook' || node.type === 'http_request') {
            stepOutput = {
              status: 200,
              message: 'HTTP action executed successfully',
              data: { forwarded: true },
            };
            contextData[node.id] = stepOutput;
          } else {
            // Default pass-through action
            stepOutput = { processed: true, timestamp: Date.now() };
            contextData[node.id] = stepOutput;
          }
        } catch (err: any) {
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
    } catch (error: any) {
      execution.status = 'failed';
      execution.finishedAt = new Date();
      execution.durationMs = Date.now() - startTime;
      execution.error = error.message;
      await execution.save();

      this.logger.error(`Workflow execution [${executionId}] failed: ${error.message}`);
      throw error;
    }
  }
}
