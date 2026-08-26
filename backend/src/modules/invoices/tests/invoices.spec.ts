import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoicesService } from '../services/invoices.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { Invoice } from '../schemas/invoice.schema';
import { PaymentLedger } from '../schemas/payment-ledger.schema';
import { Customer } from '../../crm/schemas/customer.schema';
import { CustomerActivity } from '../../crm/schemas/customer-activity.schema';

describe('InvoicesService & Payment Ledger', () => {
  let service: InvoicesService;
  let mockInvoiceModel: any;
  let mockLedgerModel: any;
  let mockCustomerModel: any;
  let mockActivityModel: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockInvoiceModel = jest.fn().mockImplementation(function (data) {
      this._id = 'inv-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockInvoiceModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'inv-1', invoiceNumber: 'INV-2026-001', total: 4800, status: 'paid' },
        { _id: 'inv-2', invoiceNumber: 'INV-2026-002', total: 2400, status: 'sent' },
      ]),
    });
    mockInvoiceModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(2),
    });
    mockInvoiceModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: 'inv-123',
        invoiceNumber: 'INV-2026-001',
        total: 4800,
        currency: 'USD',
        customerId: 'cust-123',
        paymentProvider: 'stripe',
        status: 'sent',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      }),
    });

    mockLedgerModel = jest.fn().mockImplementation(function (data) {
      this._id = 'ledg-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockCustomerModel = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    mockActivityModel = jest.fn().mockImplementation(function (data) {
      this._id = 'act-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getModelToken(Invoice.name), useValue: mockInvoiceModel },
        { provide: getModelToken(PaymentLedger.name), useValue: mockLedgerModel },
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(CustomerActivity.name), useValue: mockActivityModel },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should create an invoice and calculate line item totals', async () => {
    const inv = await service.createInvoice('org-1', 'user-1', {
      customerId: 'cust-123',
      items: [
        { description: 'Enterprise Platform Plan', quantity: 1, unitPrice: 4000, amount: 4000 },
        { description: 'Dedicated AI Agent Add-on', quantity: 2, unitPrice: 400, amount: 800 },
      ],
      dueDate: '2026-09-15T23:59:59.000Z',
    });

    expect(inv).toBeDefined();
    expect(inv.subtotal).toBe(4800);
    expect(inv.total).toBe(4800);
    expect(inv.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'invoices.invoice_created',
      'org-1',
      undefined,
      expect.objectContaining({ invoiceNumber: inv.invoiceNumber }),
    );
  });

  it('should mark invoice paid and record in Payment Ledger and Customer spend', async () => {
    const paidInv = await service.markPaid('org-1', 'inv-123', {
      provider: 'stripe',
      transactionId: 'ch_3Nstripe12345',
    });

    expect(paidInv.status).toBe('paid');
    expect(mockCustomerModel.updateOne).toHaveBeenCalledWith(
      { _id: 'cust-123' },
      { $inc: { totalSpend: 4800 } },
    );
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'invoices.invoice_paid',
      'org-1',
      undefined,
      expect.objectContaining({ total: 4800 }),
    );
  });

  it('should calculate revenue summary metrics', async () => {
    const summary = await service.getInvoiceSummary('org-1');
    expect(summary.collectedRevenue).toBe(4800);
    expect(summary.pendingReceivables).toBe(2400);
    expect(summary.invoicesCount).toBe(2);
  });
});
