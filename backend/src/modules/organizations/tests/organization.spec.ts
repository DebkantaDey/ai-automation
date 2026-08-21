import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrganizationsService } from '../organizations.service';
import { OrganizationRole } from '../../../core/common/enums/role.enum';

describe('OrganizationsService - Multi-Tenant Isolation & Management', () => {
  let orgService: OrganizationsService;
  let mockOrgModel: any;
  let mockMemberModel: any;
  let mockInviteModel: any;
  let mockWorkspaceModel: any;
  let mockUserModel: any;
  let mockAuditHooks: any;
  let mockEmailService: any;
  let mockRolesService: any;

  beforeEach(() => {
    mockOrgModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'org-100',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockOrgModel.findOne = jest.fn();
    mockOrgModel.countDocuments = jest.fn().mockResolvedValue(1);

    mockMemberModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'member-100',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockMemberModel.findOne = jest.fn();
    mockMemberModel.find = jest.fn();
    mockMemberModel.countDocuments = jest.fn().mockResolvedValue(1);
    mockMemberModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    mockInviteModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));

    mockWorkspaceModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'ws-100',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockWorkspaceModel.findOne = jest.fn();
    mockWorkspaceModel.find = jest.fn().mockResolvedValue([]);
    mockWorkspaceModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    mockUserModel = {
      findById: jest.fn().mockResolvedValue({ _id: 'user-1', save: jest.fn().mockResolvedValue(true) }),
      findOne: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    mockAuditHooks = {
      emit: jest.fn().mockResolvedValue(undefined),
    };

    mockEmailService = {
      sendInvitationEmail: jest.fn().mockResolvedValue(true),
    };

    mockRolesService = {
      resolvePermissions: jest.fn().mockResolvedValue(['*']),
      checkPermission: jest.fn().mockReturnValue(true),
    };

    orgService = new OrganizationsService(
      mockOrgModel,
      mockMemberModel,
      mockInviteModel,
      mockWorkspaceModel,
      mockUserModel,
      mockAuditHooks,
      mockEmailService,
      mockRolesService,
    );
  });

  it('should create an organization, default workspace, and assign creator as OWNER', async () => {
    mockOrgModel.findOne.mockResolvedValue(null);

    const result = await orgService.create('user-1', {
      name: 'Acme Corp',
      industry: 'Technology',
      website: 'https://acme.com',
      timezone: 'America/New_York',
      country: 'US',
      defaultCurrency: 'USD',
    });

    expect(result.organization.name).toBe('Acme Corp');
    expect(result.organization.slug).toBe('acme-corp');
    expect(result.workspace.name).toBe('Default Workspace');
    expect(result.role).toBe(OrganizationRole.OWNER);
    expect(mockAuditHooks.emit).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'organization.created' }),
    );
  });

  it('should resolve duplicate slugs automatically with sequential suffix', async () => {
    mockOrgModel.findOne
      .mockResolvedValueOnce({ slug: 'acme-corp' })
      .mockResolvedValueOnce(null);

    const result = await orgService.create('user-1', {
      name: 'Acme Corp',
    });

    expect(result.organization.slug).toBe('acme-corp-1');
  });

  it('should list all organizations the authenticated user belongs to', async () => {
    const mockMemberships = [
      {
        organizationId: {
          _id: 'org-1',
          name: 'Org 1',
          slug: 'org-1',
          plan: 'free',
          status: 'active',
          isDeleted: false,
        },
        role: OrganizationRole.OWNER,
        joinedAt: new Date(),
      },
    ];

    mockMemberModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMemberships),
      }),
    });

    const list = await orgService.getUserOrganizations('user-1');
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Org 1');
    expect(list[0].role).toBe(OrganizationRole.OWNER);
    expect(list[0].isOwner).toBe(true);
  });

  it('should permit an active member to retrieve organization details', async () => {
    mockOrgModel.findOne.mockResolvedValue({
      _id: 'org-1',
      name: 'Acme Corp',
      isDeleted: false,
    });
    mockMemberModel.findOne.mockResolvedValue({
      organizationId: 'org-1',
      userId: 'user-1',
      role: OrganizationRole.MEMBER,
      status: 'active',
    });

    const org = await orgService.findById('org-1', 'user-1');
    expect(org._id).toBe('org-1');
  });

  it('should STRICTLY reject cross-tenant access when user is not a member of the organization', async () => {
    mockOrgModel.findOne.mockResolvedValue({
      _id: 'org-secret-b',
      name: 'Secret Org B',
      isDeleted: false,
    });
    mockMemberModel.findOne.mockResolvedValue(null);

    await expect(orgService.findById('org-secret-b', 'user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow Owner or Admin to update organization settings', async () => {
    mockMemberModel.findOne.mockResolvedValue({
      organizationId: 'org-1',
      userId: 'user-admin',
      role: OrganizationRole.ADMIN,
      status: 'active',
    });

    const mockOrg = {
      _id: 'org-1',
      name: 'Old Name',
      isDeleted: false,
      save: jest.fn().mockResolvedValue(true),
    };
    mockOrgModel.findOne.mockResolvedValue(mockOrg);

    const updated = await orgService.update('org-1', 'user-admin', {
      name: 'New Name',
      website: 'https://newname.com',
    });

    expect(updated.name).toBe('New Name');
    expect(mockOrg.save).toHaveBeenCalled();
    expect(mockAuditHooks.emit).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'organization.settings.updated' }),
    );
  });

  it('should prevent non-admin/non-owner members from updating organization settings', async () => {
    mockMemberModel.findOne.mockResolvedValue({
      organizationId: 'org-1',
      userId: 'user-viewer',
      role: OrganizationRole.VIEWER,
      status: 'active',
    });

    await expect(
      orgService.update('org-1', 'user-viewer', { name: 'Unauthorized Change' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow only OWNER to delete organization', async () => {
    mockMemberModel.findOne.mockResolvedValue({
      organizationId: 'org-1',
      userId: 'user-admin',
      role: OrganizationRole.ADMIN,
      status: 'active',
    });

    await expect(orgService.delete('org-1', 'user-admin')).rejects.toThrow(ForbiddenException);
  });

  it('should switch organization successfully for an active member', async () => {
    mockMemberModel.findOne.mockResolvedValue({
      organizationId: 'org-target',
      userId: 'user-1',
      role: OrganizationRole.MEMBER,
      status: 'active',
    });

    mockOrgModel.findOne.mockResolvedValue({
      _id: 'org-target',
      name: 'Target Org',
      slug: 'target-org',
      plan: 'pro',
      isDeleted: false,
    });

    mockWorkspaceModel.findOne.mockResolvedValue({
      _id: 'ws-default',
      name: 'Default Workspace',
      slug: 'default',
    });

    const res = await orgService.switchOrganization('user-1', 'org-target');
    expect(res.activeOrganization.slug).toBe('target-org');
    expect(res.defaultWorkspace?.slug).toBe('default');
    expect(mockUserModel.updateOne).toHaveBeenCalledWith(
      { _id: 'user-1' },
      { $set: { defaultOrganizationId: 'org-target', defaultWorkspaceId: 'ws-default' } },
    );
  });
});
