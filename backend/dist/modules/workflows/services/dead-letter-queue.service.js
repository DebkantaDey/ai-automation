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
var DeadLetterQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadLetterQueueService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const dead_letter_job_schema_1 = require("../schemas/dead-letter-job.schema");
const queue_constants_1 = require("../../../core/queue/queue.constants");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let DeadLetterQueueService = DeadLetterQueueService_1 = class DeadLetterQueueService {
    deadLetterModel;
    workflowQueue;
    eventBus;
    logger = new common_1.Logger(DeadLetterQueueService_1.name);
    constructor(deadLetterModel, workflowQueue, eventBus) {
        this.deadLetterModel = deadLetterModel;
        this.workflowQueue = workflowQueue;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async recordFailure(data) {
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
            this.eventBus.emit('workflows.dead_letter_captured', data.organizationId, data.workspaceId, { dlqId: dlqJob._id, executionId: data.executionId, reason: data.failedReason });
        }
        return dlqJob;
    }
    async listDeadLetterJobs(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
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
    async getDeadLetterJob(organizationId, id) {
        const job = await this.deadLetterModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
        })
            .populate('workflowId', 'name nodes edges')
            .populate('executionId')
            .exec();
        if (!job) {
            throw new common_1.NotFoundException(`Dead letter job with id '${id}' not found`);
        }
        return job;
    }
    async replayJob(organizationId, id, userId, customPayload) {
        const job = await this.getDeadLetterJob(organizationId, id);
        job.status = 'retrying';
        job.replayedAt = new Date();
        job.replayedByUserId = this.toObjectId(userId);
        await job.save();
        const payloadToRun = customPayload || job.inputPayload;
        if (this.workflowQueue) {
            await this.workflowQueue.add(queue_constants_1.JOB_EXECUTE_WORKFLOW, {
                organizationId,
                workspaceId: job.workspaceId?.toString(),
                workflowId: job.workflowId.toString(),
                executionId: job.executionId.toString(),
                payload: payloadToRun,
                isReplay: true,
                replayedDlqId: job._id.toString(),
            }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
            });
        }
        this.logger.log(`Replayed dead letter job [${job._id}] via BullMQ queue`);
        if (this.eventBus) {
            this.eventBus.emit('workflows.dlq_replayed', organizationId, job.workspaceId?.toString(), { dlqId: job._id, workflowId: job.workflowId });
        }
        return job;
    }
    async dismissJob(organizationId, id, userId) {
        const job = await this.getDeadLetterJob(organizationId, id);
        job.status = 'dismissed';
        job.replayedByUserId = this.toObjectId(userId);
        await job.save();
        return job;
    }
};
exports.DeadLetterQueueService = DeadLetterQueueService;
exports.DeadLetterQueueService = DeadLetterQueueService = DeadLetterQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(dead_letter_job_schema_1.DeadLetterJob.name)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, bullmq_1.InjectQueue)(queue_constants_1.QUEUE_WORKFLOW_EXECUTION)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        bullmq_2.Queue,
        event_bus_service_1.EventBusService])
], DeadLetterQueueService);
//# sourceMappingURL=dead-letter-queue.service.js.map