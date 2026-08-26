import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ApprovalsService } from '../services/approvals.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { ApprovalRequest } from '../schemas/approval-request.schema';

describe('ApprovalsService (Human-in-the-Loop Gate)', () => {
  let service: ApprovalsService;
  let mockApprovalModel: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockApprovalModel = jest.fn().mockImplementation(function (data) {
      this._id = 'appr-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockApprovalModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'appr-1',
          actionType: 'issue_refund',
          title: 'Refund Request: ₹50,000 for Customer #CUST-992',
          status: 'pending',
        },
      ]),
    });
    mockApprovalModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    mockApprovalModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: 'appr-123',
        actionType: 'issue_refund',
        title: 'Refund Request',
        status: 'pending',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      }),
    });

    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        { provide: getModelToken(ApprovalRequest.name), useValue: mockApprovalModel },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<ApprovalsService>(ApprovalsService);
  });

  it('should create a pending approval request and emit approvals.requested', async () => {
    const req = await service.createApproval('org-1', {
      actionType: 'issue_refund',
      title: 'Refund Request: ₹50,000',
      reason: 'Customer cancelled within 7 day SLA window',
      payload: { amount: 50000, customerId: 'cust-123' },
    });

    expect(req).toBeDefined();
    expect(req.status).toBe('pending');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'approvals.requested',
      'org-1',
      undefined,
      expect.objectContaining({ actionType: 'issue_refund' }),
    );
  });

  it('should review approval request and authorize or reject', async () => {
    const reviewed = await service.reviewApproval('org-1', 'appr-123', 'manager-1', 'approved', 'Authorized by Billing Manager');
    expect(reviewed.status).toBe('approved');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'approvals.reviewed',
      'org-1',
      undefined,
      expect.objectContaining({ decision: 'approved' }),
    );
  });
});
