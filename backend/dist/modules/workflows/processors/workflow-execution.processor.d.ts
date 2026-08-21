import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
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
export declare class WorkflowExecutionProcessor extends WorkerHost {
    private readonly workflowEngine;
    private readonly logger;
    constructor(workflowEngine: WorkflowEngineService);
    process(job: Job<WorkflowJobData>): Promise<any>;
}
