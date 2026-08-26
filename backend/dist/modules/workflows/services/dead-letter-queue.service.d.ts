import { Model, Types } from 'mongoose';
import { Queue } from 'bullmq';
import { DeadLetterJob, DeadLetterJobDocument } from '../schemas/dead-letter-job.schema';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class DeadLetterQueueService {
    private readonly deadLetterModel;
    private readonly workflowQueue?;
    private readonly eventBus?;
    private readonly logger;
    constructor(deadLetterModel: Model<DeadLetterJobDocument>, workflowQueue?: Queue, eventBus?: EventBusService);
    private toObjectId;
    recordFailure(data: {
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
    }): Promise<DeadLetterJobDocument>;
    listDeadLetterJobs(organizationId: string, query?: {
        status?: string;
        workflowId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, DeadLetterJobDocument, {}, {}> & DeadLetterJob & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDeadLetterJob(organizationId: string, id: string): Promise<DeadLetterJobDocument>;
    replayJob(organizationId: string, id: string, userId: string, customPayload?: Record<string, any>): Promise<DeadLetterJobDocument>;
    dismissJob(organizationId: string, id: string, userId: string): Promise<DeadLetterJobDocument>;
}
