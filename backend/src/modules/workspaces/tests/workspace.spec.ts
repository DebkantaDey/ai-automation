import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkspacesService } from '../workspaces.service';

describe('WorkspacesService - Multi-Tenant Scoping & Lifecycle', () => {
  let workspacesService: WorkspacesService;
  let mockWorkspaceModel: any;

  beforeEach(() => {
    mockWorkspaceModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'ws-mock-id' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockWorkspaceModel.findOne = jest.fn();
    mockWorkspaceModel.find = jest.fn();

    workspacesService = new WorkspacesService(mockWorkspaceModel);
  });

  describe('1. Workspace Creation & Scoped Auto-Slug', () => {
    it('should create a workspace with auto-generated slug scoped to the organization', async () => {
      mockWorkspaceModel.findOne.mockResolvedValue(null);

      const result = await workspacesService.create('org-1', 'user-1', {
        name: 'Marketing Campaigns',
        description: 'Automations for marketing',
        color: '#10B981',
      });

      expect(result.name).toBe('Marketing Campaigns');
      expect(result.slug).toBe('marketing-campaigns');
      expect(result.isDefault).toBe(false);
      expect(result.status).toBe('active');
    });

    it('should resolve duplicate slugs within the SAME organization by appending counter', async () => {
      mockWorkspaceModel.findOne
        .mockResolvedValueOnce({ slug: 'marketing' })
        .mockResolvedValueOnce(null);

      const result = await workspacesService.create('org-1', 'user-1', {
        name: 'Marketing',
      });

      expect(result.slug).toBe('marketing-1');
    });

    it('should allow the SAME slug in DIFFERENT organizations (compound uniqueness)', async () => {
      mockWorkspaceModel.findOne.mockImplementation(({ organizationId, slug }) => {
        if (organizationId?.toString() === 'org-2' && slug === 'marketing') {
          return Promise.resolve(null);
        }
        return Promise.resolve({ slug: 'marketing', organizationId: 'org-1' });
      });

      const result = await workspacesService.create('org-2', 'user-1', {
        name: 'Marketing',
      });

      expect(result.slug).toBe('marketing');
      expect(result.organizationId.toString()).toBe('org-2');
    });
  });

  describe('2. Idempotent Default Workspace Provisioning', () => {
    it('should create a default workspace if none exists', async () => {
      mockWorkspaceModel.findOne.mockResolvedValue(null);

      const ws = await workspacesService.ensureDefaultWorkspace('org-1', 'user-1');
      expect(ws.name).toBe('Default Workspace');
      expect(ws.slug).toBe('default');
      expect(ws.isDefault).toBe(true);
    });

    it('should return the existing default workspace without creating a duplicate', async () => {
      const existingDefault = {
        _id: 'ws-existing-default',
        organizationId: 'org-1',
        name: 'Default Workspace',
        slug: 'default',
        isDefault: true,
      };
      mockWorkspaceModel.findOne.mockResolvedValue(existingDefault);

      const ws = await workspacesService.ensureDefaultWorkspace('org-1', 'user-1');
      expect(ws._id).toBe('ws-existing-default');
      expect(mockWorkspaceModel).not.toHaveBeenCalled();
    });
  });

  describe('3. Multi-Tenant Scoping & Listing', () => {
    it('should list all workspaces strictly filtered by organizationId', async () => {
      const mockList = [
        { _id: 'ws-1', name: 'Default', slug: 'default', isDefault: true },
        { _id: 'ws-2', name: 'Engineering', slug: 'engineering', isDefault: false },
      ];

      mockWorkspaceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockList),
        }),
      });

      const list = await workspacesService.listByOrganization('org-1');
      expect(list.length).toBe(2);
      expect(mockWorkspaceModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: false }),
      );
    });

    it('should reject finding a workspace if it belongs to a different organization', async () => {
      mockWorkspaceModel.findOne.mockResolvedValue(null);

      await expect(
        workspacesService.findById('ws-org-b', 'org-a'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('4. Protection of Default Workspace & Archiving', () => {
    it('should PREVENT deleting the default workspace', async () => {
      mockWorkspaceModel.findOne.mockResolvedValue({
        _id: 'ws-default',
        organizationId: 'org-1',
        name: 'Default Workspace',
        isDefault: true,
        isDeleted: false,
      });

      await expect(
        workspacesService.delete('ws-default', 'org-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should PREVENT archiving the default workspace', async () => {
      mockWorkspaceModel.findOne.mockResolvedValue({
        _id: 'ws-default',
        organizationId: 'org-1',
        name: 'Default Workspace',
        isDefault: true,
        isDeleted: false,
      });

      await expect(
        workspacesService.archive('ws-default', 'org-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow archiving a custom workspace', async () => {
      const mockCustomWs = {
        _id: 'ws-custom',
        organizationId: 'org-1',
        name: 'Old Project',
        isDefault: false,
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };
      mockWorkspaceModel.findOne.mockResolvedValue(mockCustomWs);

      const result = await workspacesService.archive('ws-custom', 'org-1');
      expect(result.status).toBe('archived');
      expect(mockCustomWs.save).toHaveBeenCalled();
    });

    it('should allow deleting a non-default workspace', async () => {
      const mockCustomWs = {
        _id: 'ws-custom',
        organizationId: 'org-1',
        name: 'Temporary Workspace',
        isDefault: false,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };
      mockWorkspaceModel.findOne.mockResolvedValue(mockCustomWs);

      const result = await workspacesService.delete('ws-custom', 'org-1');
      expect(result).toBe(true);
      expect(mockCustomWs.isDeleted).toBe(true);
    });
  });
});
