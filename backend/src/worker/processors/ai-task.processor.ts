import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_AI_TASKS, JOB_PROCESS_AI_TASK } from '../../core/queue/queue.constants';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';

@Processor(QUEUE_AI_TASKS)
export class AiTaskProcessor extends WorkerHost {
  private readonly logger = new Logger(AiTaskProcessor.name);

  constructor(private readonly aiGateway: AiGatewayService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== JOB_PROCESS_AI_TASK) {
      return;
    }

    const { prompt, messages, options } = job.data;
    this.logger.log(`Processing asynchronous AI background task [${job.id}]`);

    if (messages && Array.isArray(messages)) {
      return this.aiGateway.generateChat(messages, options);
    }

    return this.aiGateway.generateCompletion(prompt, options);
  }
}
