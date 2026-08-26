import { Test, TestingModule } from '@nestjs/testing';
import { AgentToolsRegistry } from '../tools/agent-tools.registry';
import { LeadsService } from '../../crm/services/leads.service';
import { CustomersService } from '../../crm/services/customers.service';
import { AppointmentsService } from '../../calendar/services/appointments.service';
import { InvoicesService } from '../../invoices/services/invoices.service';

describe('AgentToolsRegistry', () => {
  let registry: AgentToolsRegistry;
  let mockLeadsService: any;
  let mockCustomersService: any;
  let mockAppointmentsService: any;
  let mockInvoicesService: any;

  beforeEach(async () => {
    mockLeadsService = {
      createLead: jest.fn().mockResolvedValue({
        _id: 'lead-123',
        name: 'Alex Mercer',
        leadScore: 88,
        priority: 'high',
      }),
    };

    mockCustomersService = {
      listCustomers: jest.fn().mockResolvedValue({
        data: [{ _id: 'cust-123', name: 'Sarah Jenkins', company: 'Global Logistics', totalSpend: 48000, tier: 'enterprise' }],
      }),
      getCustomer360: jest.fn().mockResolvedValue({
        activities: [{ title: 'Invoice #1 Paid' }],
      }),
    };

    mockAppointmentsService = {
      createAppointment: jest.fn().mockResolvedValue({
        _id: 'apt-123',
        startTime: new Date('2026-08-26T14:00:00.000Z'),
        meetingUrl: 'https://meet.google.com/automa-demo',
      }),
    };

    mockInvoicesService = {
      createInvoice: jest.fn().mockResolvedValue({
        _id: 'inv-123',
        invoiceNumber: 'INV-2026-001',
        total: 2400,
        hostedPaymentUrl: 'https://checkout.stripe.com/pay/inv-2026-001',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentToolsRegistry,
        { provide: LeadsService, useValue: mockLeadsService },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: AppointmentsService, useValue: mockAppointmentsService },
        { provide: InvoicesService, useValue: mockInvoicesService },
      ],
    }).compile();

    registry = module.get<AgentToolsRegistry>(AgentToolsRegistry);
  });

  it('should identify sensitive tools requiring approval', () => {
    expect(registry.isToolSensitive('issue_refund')).toBe(true);
    expect(registry.isToolSensitive('send_mass_whatsapp')).toBe(true);
    expect(registry.isToolSensitive('lookup_customer')).toBe(false);
  });

  it('should execute lookup_customer tool', async () => {
    const result = await registry.executeTool('org-1', 'lookup_customer', { query: 'Sarah Jenkins' });
    expect(result.found).toBe(true);
    expect(result.customer.name).toBe('Sarah Jenkins');
  });

  it('should execute create_lead tool', async () => {
    const result = await registry.executeTool('org-1', 'create_lead', {
      name: 'Alex Mercer',
      email: 'alex@mercer.com',
    });
    expect(result.success).toBe(true);
    expect(result.leadScore).toBe(88);
  });

  it('should execute book_appointment tool', async () => {
    const result = await registry.executeTool('org-1', 'book_appointment', {
      title: 'AI Demo',
      startTime: '2026-08-26T14:00:00.000Z',
    });
    expect(result.success).toBe(true);
    expect(result.meetingUrl).toContain('meet.google.com');
  });
});
