import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CustomersService } from '../services/customers.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { Customer } from '../schemas/customer.schema';
import { CustomerActivity } from '../schemas/customer-activity.schema';
import { Deal } from '../schemas/deal.schema';

describe('CustomersService & 360 Aggregation', () => {
  let service: CustomersService;
  let mockCustomerModel: any;
  let mockActivityModel: any;
  let mockDealModel: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockCustomerModel = jest.fn().mockImplementation(function (data) {
      this._id = 'cust-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockCustomerModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: 'cust-123',
        name: 'Sarah Jenkins',
        company: 'Global Logistics Corp',
        totalSpend: 58400,
        lifetimeValue: 120000,
        status: 'active',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      }),
    });
    mockCustomerModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'cust-123', name: 'Sarah Jenkins', totalSpend: 58400 },
      ]),
    });
    mockCustomerModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    mockCustomerModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    mockActivityModel = jest.fn().mockImplementation(function (data) {
      this._id = 'act-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockActivityModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'act-1', title: 'Invoice #INV-2026-088 Paid ($4,800)', activityType: 'invoice' },
        { _id: 'act-2', title: 'WhatsApp query answered by AI Sales Agent', activityType: 'message' },
      ]),
    });

    mockDealModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { _id: 'deal-1', title: 'Enterprise Omnichannel License', value: 48000, stage: 'won' },
        ]),
      }),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(CustomerActivity.name), useValue: mockActivityModel },
        { provide: getModelToken(Deal.name), useValue: mockDealModel },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should create customer and emit creation event', async () => {
    const customer = await service.createCustomer('org-1', 'user-1', {
      name: 'Sarah Jenkins',
      email: 'sjenkins@globallogistics.com',
      company: 'Global Logistics Corp',
      tier: 'enterprise',
    });

    expect(customer).toBeDefined();
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'crm.customer_created',
      'org-1',
      undefined,
      expect.objectContaining({ customerId: 'cust-123', tier: 'enterprise' }),
    );
  });

  it('should aggregate 360-degree customer profile, deals, and activities timeline', async () => {
    const profile360 = await service.getCustomer360('org-1', 'cust-123');

    expect(profile360.customer).toBeDefined();
    expect(profile360.activities.length).toBe(2);
    expect(profile360.deals.length).toBe(1);
    expect(profile360.metrics.wonDealsValue).toBe(48000);
  });
});
