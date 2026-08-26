import {
  Injectable,
  NotFoundException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DeadLetterJob, DeadLetterJobDocument } from '../schemas/dead-letter-job.schema';
import {
  QUEUE_WORKFLOW_EXECUTION,
  JOB_EXECUTE_WORKFLOW,
} from '../../../core/queue/queue.constants';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class DeadLetterQueueService {
  private readonly logger = new Logger(DeadLetterQueueService.name);

  constructor(
    @InjectModel(DeadLetterJob.name)
    private readonly deadLetterModel: Model<DeadLetterJobDocument>,
    @Optional()
    @InjectQueue(QUEUE_WORKFLOW_EXECUTION)
    private readonly workflowQueue?: Queue,
    @Optional()
    private readonly eventBus?: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async recordFailure(data: {
    organizationId: string;
    workspaceId?: string;
    workflowId: string;
    executionId: string;
    jobId?: string;
    failedReason: string;
    stackTrace?: string;
    failedStepNodeId?: string;
    inputPayload?: Record<string, any>;
    executionSnapshot?: Record<string, any>;
    attemptsMade?: number;
  }): Promise<DeadLetterJobDocument> {
    const dlqJob = new this.deadLetterModel({
      organizationId: this.toObjectId(data.organizationId),
      workspaceId: data.workspaceId ? this.toObjectId(data.workspaceId) : undefined,
      workflowId: this.toObjectId(data.workflowId),
      executionId: this.toObjectId(data.executionId),
      jobId: data.jobId || `job_${Date.now()}`,
      failedReason: data.failedReason,
      stackTrace: data.stackTrace,
      failedStepNodeId: data.failedStepNodeId,
      inputPayload: data.inputPayload || {},
      executionSnapshot: data.executionSnapshot || {},
      attemptsMade: data.attemptsMade || 3,
      status: 'failed',
    });

    await dlqJob.save();
    this.logger.warn(`Recorded dead letter job [${dlqJob._id}] for execution [${data.executionId}]`);

    if (this.eventBus) {
      this.eventBus.emit(
        'workflows.dead_letter_captured',
        data.organizationId,
        data.workspaceId,
        { dlqId: dlqJob._id, executionId: data.executionId, reason: data.failedReason },
      );
    }

    return dlqJob;
  }

  async listDeadLetterJobs(
    organizationId: string,
    query: {
      status?: string;
      workflowId?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
    };

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    if (query.workflowId) {
      filter.workflowId = this.toObjectId(query.workflowId);
    }

    const [jobs, total] = await Promise.all([
      this.deadLetterModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('workflowId', 'name triggerType')
        .populate('executionId', 'status startedAt triggerPayload')
        .exec(),
      this.deadLetterModel.countDocuments(filter).exec(),
    ]);

    return {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDeadLetterJob(organizationId: string, id: string): Promise<DeadLetterJobDocument> {
    const job = await this.deadLetterModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
      })
      .populate('workflowId', 'name nodes edges')
      .populate('executionId')
      .exec();

    if (!job) {
      throw new NotFoundException(`Dead letter job with id '${id}' not found`);
    }
    return job;
  }

  async replayJob(
    organizationId: string,
    id: string,
    userId: string,
    customPayload?: Record<string, any>,
  ): Promise<DeadLetterJobDocument> {
    const job = await this.getDeadLetterJob(organizationId, id);

    job.status = 'retrying';
    job.replayedAt = new Date();
    job.replayedByUserId = this.toObjectId(userId);
    await job.save();

    const payloadToRun = customPayload || job.inputPayload;

    if (this.workflowQueue) {
      await this.workflowQueue.add(
        JOB_EXECUTE_WORKFLOW,
        {
          organizationId,
          workspaceId: job.workspaceId?.toString(),
          workflowId: job.workflowId.toString(),
          executionId: job.executionId.toString(),
          payload: payloadToRun,
          isReplay: true,
          replayedDlqId: job._id.toString(),
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
    }

    this.logger.log(`Replayed dead letter job [${job._id}] via BullMQ queue`);

    if (this.eventBus) {
      this.eventBus.emit(
        'workflows.dlq_replayed',
        organizationId,
        job.workspaceId?.toString(),
        { dlqId: job._id, workflowId: job.workflowId },
      );
    }

    return job;
  }

  async dismissJob(organizationId: string, id: string, userId: string): Promise<DeadLetterJobDocument> {
    const job = await this.getDeadLetterJob(organizationId, id);
    job.status = 'dismissed';
    job.replayedByUserId = this.toObjectId(userId);
    await job.save();
    return job;
  }
}
