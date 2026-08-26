import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bullmq';
import { DeadLetterQueueService } from '../services/dead-letter-queue.service';
import { DeadLetterJob } from '../schemas/dead-letter-job.schema';
import { QUEUE_WORKFLOW_EXECUTION, JOB_EXECUTE_WORKFLOW } from '../../../core/queue/queue.constants';
import { EventBusService } from '../../../core/events/event-bus.service';

describe('DeadLetterQueueService (DLQ & Replay Engine)', () => {
  let service: DeadLetterQueueService;
  let mockDeadLetterModel: any;
  let mockWorkflowQueue: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockDeadLetterModel = jest.fn().mockImplementation(function (data) {
      this._id = 'dlq-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockDeadLetterModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'dlq-1',
          workflowId: 'wf-1',
          executionId: 'exec-1',
          failedReason: 'Third-party webhook endpoint returned 504 Gateway Timeout',
          status: 'failed',
        },
      ]),
    });

    mockDeadLetterModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    mockDeadLetterModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: 'dlq-123',
        workflowId: 'wf-1',
        executionId: 'exec-1',
        workspaceId: 'ws-1',
        inputPayload: { leadId: 'lead-123' },
        status: 'failed',
        save: jest.fn().mockResolvedValue(true),
      }),
    });

    mockWorkflowQueue = {
      add: jest.fn().mockResolvedValue({ id: 'replayed-job-1' }),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeadLetterQueueService,
        { provide: getModelToken(DeadLetterJob.name), useValue: mockDeadLetterModel },
        { provide: getQueueToken(QUEUE_WORKFLOW_EXECUTION), useValue: mockWorkflowQueue },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<DeadLetterQueueService>(DeadLetterQueueService);
  });

  it('should record terminal execution failure into DeadLetterJob', async () => {
    const job = await service.recordFailure({
      organizationId: 'org-1',
      workspaceId: 'ws-1',
      workflowId: 'wf-1',
      executionId: 'exec-1',
      failedReason: 'Rate limit exceeded on external CRM API (429)',
      failedStepNodeId: 'crm-sync-node',
      inputPayload: { amount: 5000 },
      attemptsMade: 3,
    });

    expect(job).toBeDefined();
    expect(job.failedReason).toContain('Rate limit exceeded');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'workflows.dead_letter_captured',
      'org-1',
      'ws-1',
      expect.objectContaining({ reason: expect.stringContaining('Rate limit exceeded') }),
    );
  });

  it('should list dead letter jobs with pagination', async () => {
    const result = await service.listDeadLetterJobs('org-1');
    expect(result.data.length).toBe(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should replay dead letter job through BullMQ distributed queue', async () => {
    const replayed = await service.replayJob('org-1', 'dlq-123', 'user-1');
    expect(replayed.status).toBe('retrying');
    expect(mockWorkflowQueue.add).toHaveBeenCalledWith(
      JOB_EXECUTE_WORKFLOW,
      expect.objectContaining({
        isReplay: true,
        workflowId: 'wf-1',
      }),
      expect.any(Object),
    );
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'workflows.dlq_replayed',
      'org-1',
      'ws-1',
      expect.objectContaining({ dlqId: 'dlq-123' }),
    );
  });
});
