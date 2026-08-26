import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeadsService } from '../services/leads.service';
import { LeadScoringService } from '../services/lead-scoring.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { Lead } from '../schemas/lead.schema';
import { Customer } from '../schemas/customer.schema';
import { Deal } from '../schemas/deal.schema';
import { CustomerActivity } from '../schemas/customer-activity.schema';

describe('LeadsService', () => {
  let service: LeadsService;
  let mockLeadModel: any;
  let mockCustomerModel: any;
  let mockDealModel: any;
  let mockActivityModel: any;
  let mockScoringService: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockLeadModel = jest.fn().mockImplementation(function (data) {
      this._id = 'lead-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockLeadModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'lead-1', name: 'David Vance', leadScore: 92, status: 'new' },
      ]),
    });
    mockLeadModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    mockLeadModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: 'lead-123',
        name: 'David Vance',
        leadScore: 92,
        status: 'qualified',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      }),
    });

    mockCustomerModel = jest.fn().mockImplementation(function (data) {
      this._id = 'cust-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockDealModel = jest.fn().mockImplementation(function (data) {
      this._id = 'deal-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockActivityModel = jest.fn().mockImplementation(function (data) {
      this._id = 'act-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockScoringService = {
      scoreLead: jest.fn().mockResolvedValue({
        score: 92,
        confidence: 0.9,
        priority: 'high',
        reasons: ['Corporate domain verified', 'Requested enterprise demo'],
      }),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: getModelToken(Lead.name), useValue: mockLeadModel },
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(Deal.name), useValue: mockDealModel },
        { provide: getModelToken(CustomerActivity.name), useValue: mockActivityModel },
        { provide: LeadScoringService, useValue: mockScoringService },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should create and automatically score a lead', async () => {
    const lead = await service.createLead('org-1', 'user-1', {
      name: 'David Vance',
      email: 'dvance@logistics-core.com',
      company: 'Global Logistics Corp',
      source: 'whatsapp',
    });

    expect(lead).toBeDefined();
    expect(mockScoringService.scoreLead).toHaveBeenCalled();
    expect(lead.leadScore).toBe(92);
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'crm.lead_created',
      'org-1',
      undefined,
      expect.objectContaining({ leadId: 'lead-123' }),
    );
  });

  it('should list leads with pagination and filtering', async () => {
    const result = await service.listLeads('org-1', { page: 1, limit: 10 });
    expect(result.data.length).toBe(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should convert qualified lead to customer and deal', async () => {
    const conversion = await service.convertLead('org-1', 'user-1', 'lead-123', {
      dealTitle: 'Enterprise Omnichannel License',
      dealValue: 48000,
    });

    expect(conversion.customer).toBeDefined();
    expect(conversion.deal).toBeDefined();
    expect(conversion.lead.status).toBe('won');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'crm.lead_converted',
      'org-1',
      undefined,
      expect.objectContaining({ customerId: 'cust-123', leadId: 'lead-123' }),
    );
  });
});
