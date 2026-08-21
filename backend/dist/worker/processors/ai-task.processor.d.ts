import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';
export declare class AiTaskProcessor extends WorkerHost {
    private readonly aiGateway;
    private readonly logger;
    constructor(aiGateway: AiGatewayService);
    process(job: Job<any, any, string>): Promise<any>;
}
