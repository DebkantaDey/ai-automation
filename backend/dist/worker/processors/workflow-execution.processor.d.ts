import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { WorkflowExecutionDocument } from '../../modules/workflows/schemas/workflow-execution.schema';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';
export declare class WorkflowExecutionProcessor extends WorkerHost {
    private readonly executionModel;
    private readonly aiGateway;
    private readonly logger;
    constructor(executionModel: Model<WorkflowExecutionDocument>, aiGateway: AiGatewayService);
    process(job: Job<any, any, string>): Promise<any>;
}
