import { TemplatesService } from '../templates.service';

describe('Workflow Templates Catalog & Workspace Cloning', () => {
  let templatesService: TemplatesService;
  let mockWorkflowsService: any;

  beforeEach(() => {
    mockWorkflowsService = {
      create: jest.fn().mockImplementation((orgId, wsId, userId, dto) => ({
        _id: 'wf-cloned-1',
        ...dto,
      })),
    };

    templatesService = new TemplatesService(mockWorkflowsService);
  });

  it('should list all available enterprise workflow templates', () => {
    const list = templatesService.listTemplates();
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list.some((t) => t.category === 'Sales')).toBe(true);
    expect(list.some((t) => t.category === 'Support')).toBe(true);
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
