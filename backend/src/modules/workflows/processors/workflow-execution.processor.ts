import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_WORKFLOW_EXECUTION, JOB_EXECUTE_WORKFLOW } from '../../../core/queue/queue.constants';
import { WorkflowEngineService } from '../engine/workflow-engine.service';

export interface WorkflowJobData {
  executionId: string;
  workflowId: string;
  organizationId: string;
  workspaceId: string;
  nodes: any[];
  edges: any[];
  initialPayload?: Record<string, any>;
}

@Processor(QUEUE_WORKFLOW_EXECUTION)
export class WorkflowExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowExecutionProcessor.name);

  constructor(private readonly workflowEngine: WorkflowEngineService) {
    super();
  }

  async process(job: Job<WorkflowJobData>): Promise<any> {
    if (job.name === JOB_EXECUTE_WORKFLOW) {
      const { executionId, nodes, edges, initialPayload } = job.data;
      this.logger.log(`Processing workflow execution job [${job.id}] for execution [${executionId}]`);

      return this.workflowEngine.runWorkflow(executionId, nodes, edges, initialPayload || {});
    }

    this.logger.warn(`Unknown workflow job name: [${job.name}]`);
  }
}
