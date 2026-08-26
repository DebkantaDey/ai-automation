import { TemplatesService } from '../templates.service';

describe('TemplatesService (Workflows & Multi-Vertical Blueprints)', () => {
  let templatesService: TemplatesService;
  let mockWorkflowsService: any;
  let mockAgentsService: any;
  let mockLeadsService: any;
  let mockCustomersService: any;
  let mockInvoicesService: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockWorkflowsService = {
      create: jest.fn().mockImplementation((orgId, wsId, userId, dto) => ({
        _id: 'wf-cloned-1',
        ...dto,
      })),
    };

    mockAgentsService = {
      createAgent: jest.fn().mockResolvedValue({
        _id: 'agent-123',
        name: 'Property Advisor AI',
      }),
    };

    mockLeadsService = {
      createLead: jest.fn().mockResolvedValue({
        _id: 'lead-123',
        name: 'Vikram Malhotra',
        leadScore: 92,
      }),
    };

    mockCustomersService = {
      createCustomer: jest.fn().mockResolvedValue({
        _id: 'cust-123',
        name: 'Vikram Malhotra',
      }),
    };

    mockInvoicesService = {
      createInvoice: jest.fn().mockResolvedValue({
        _id: 'inv-123',
        invoiceNumber: 'INV-2026-001',
        total: 850000,
      }),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    templatesService = new TemplatesService(
      mockWorkflowsService,
      mockAgentsService,
      mockLeadsService,
      mockCustomersService,
      mockInvoicesService,
      mockEventBus,
    );
  });

  it('should list all available enterprise workflow templates', () => {
    const list = templatesService.listTemplates();
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list.some((t) => t.category === 'Sales')).toBe(true);
    expect(list.some((t) => t.category === 'Support')).toBe(true);
  });

  it('should list multi-vertical business blueprints (Real Estate, Healthcare, Coaching, Salons, Contractors)', () => {
    const verticals = templatesService.listVerticals();
    expect(verticals.length).toBe(5);
    expect(verticals.some((v) => v.industry === 'Real Estate')).toBe(true);
    expect(verticals.some((v) => v.industry === 'Healthcare & Clinics')).toBe(true);
    expect(verticals.some((v) => v.industry === 'Education & Coaching')).toBe(true);
    expect(verticals.some((v) => v.industry === 'Salons & Spas')).toBe(true);
    expect(verticals.some((v) => v.industry === 'Contractors & Services')).toBe(true);
  });

  it('should 1-click instantiate vertical blueprint into active workspace', async () => {
    const result = await templatesService.instantiateVertical(
      'real-estate-agency',
      'org-1',
      'ws-1',
      'user-1',
    );

    expect(result.success).toBe(true);
    expect(result.blueprint.slug).toBe('real-estate-agency');
    expect(result.instantiatedAssets.workflow).toBeDefined();
    expect(result.instantiatedAssets.agent).toBeDefined();
    expect(result.instantiatedAssets.seededLeadsCount).toBe(2);
    expect(result.instantiatedAssets.sampleCustomer).toBeDefined();
    expect(result.instantiatedAssets.sampleInvoice).toBeDefined();
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'templates.vertical_instantiated',
      'org-1',
      'ws-1',
      expect.objectContaining({ slug: 'real-estate-agency' }),
    );
  });

  it('should clone template graph directly into workspace', async () => {
    const cloned = await templatesService.cloneTemplate(
      'lead-qualification-enrichment',
      'org-1',
      'ws-1',
      'user-1',
      'Custom Lead Pipeline',
    );

    expect(cloned.name).toBe('Custom Lead Pipeline');
    expect(cloned.nodes.length).toBeGreaterThan(1);
    expect(mockWorkflowsService.create).toHaveBeenCalledWith(
      'org-1',
      'ws-1',
      'user-1',
      expect.objectContaining({ name: 'Custom Lead Pipeline' }),
    );
  });
});
