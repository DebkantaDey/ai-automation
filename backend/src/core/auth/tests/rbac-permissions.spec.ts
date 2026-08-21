import { ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { RolesService } from '../../../modules/roles/roles.service';
import { OrganizationsService } from '../../../modules/organizations/organizations.service';
import { Permission } from '../../common/enums/permission.enum';
import { OrganizationRole } from '../../common/enums/role.enum';

describe('RBAC & Permission System - Multi-Tenant Authorization', () => {
  let rolesService: RolesService;
  let orgService: OrganizationsService;
  let mockRoleModel: any;
  let mockMemberModel: any;
  let mockOrgModel: any;
  let mockInviteModel: any;
  let mockWorkspaceModel: any;
  let mockUserModel: any;
  let mockAuditHooks: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockRoleModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'role-custom-1',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockRoleModel.findOne = jest.fn();
    mockRoleModel.find = jest.fn().mockResolvedValue([]);
    mockRoleModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    mockMemberModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'member-1',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockMemberModel.findOne = jest.fn();
    mockMemberModel.find = jest.fn();
    mockMemberModel.countDocuments = jest.fn().mockResolvedValue(1);
    mockMemberModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    mockOrgModel = {
      findOne: jest.fn(),
      findById: jest.fn().mockResolvedValue({ _id: 'org-1', name: 'Acme Corp', slug: 'acme' }),
    };

    mockInviteModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'invite-1',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockInviteModel.findOne = jest.fn();
    mockInviteModel.find = jest.fn();
    mockInviteModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    mockInviteModel.findOneAndUpdate = jest.fn();

    mockWorkspaceModel = {
      findOne: jest.fn().mockResolvedValue({ _id: 'ws-1', name: 'Default', slug: 'default' }),
    };

    mockUserModel = {
      findById: jest.fn().mockResolvedValue({ _id: 'user-1', firstName: 'Alex', email: 'alex@co.com', save: jest.fn().mockResolvedValue(true) }),
      findOne: jest.fn().mockResolvedValue(null),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    mockAuditHooks = {
      emit: jest.fn().mockResolvedValue(undefined),
    };

    mockEmailService = {
      sendInvitationEmail: jest.fn().mockResolvedValue(true),
    };

    rolesService = new RolesService(mockRoleModel, mockMemberModel);
    orgService = new OrganizationsService(
      mockOrgModel as any,
      mockMemberModel as any,
      mockInviteModel as any,
      mockWorkspaceModel as any,
      mockUserModel as any,
      mockAuditHooks as any,
      mockEmailService as any,
      rolesService,
    );
  });

  describe('1. Role Permission Evaluation & Wildcards', () => {
    it('should grant Owner full wildcard access to all system actions', async () => {
      const perms = await rolesService.resolvePermissions('org-1', 'owner');
      expect(rolesService.checkPermission(perms, Permission.ORGANIZATION_DELETE)).toBe(true);
      expect(rolesService.checkPermission(perms, Permission.WORKFLOW_DELETE)).toBe(true);
      expect(rolesService.checkPermission(perms, Permission.BILLING_MANAGE)).toBe(true);
    });

    it('should allow Admin to manage members & workflows but deny organization deletion', async () => {
      const perms = await rolesService.resolvePermissions('org-1', 'admin');
      expect(rolesService.checkPermission(perms, Permission.MEMBERS_INVITE)).toBe(true);
      expect(rolesService.checkPermission(perms, Permission.WORKFLOW_CREATE)).toBe(true);
      expect(rolesService.checkPermission(perms, Permission.ORGANIZATION_DELETE)).toBe(false);
    });

    it('should restrict Operator to workflow execution and read-only tasks', async () => {
      const perms = await rolesService.resolvePermissions('org-1', 'operator');
      expect(rolesService.checkPermission(perms, Permission.WORKFLOW_EXECUTE)).toBe(true);
      expect(rolesService.checkPermission(perms, Permission.WORKFLOW_DELETE)).toBe(false);
      expect(rolesService.checkPermission(perms, Permission.MEMBERS_INVITE)).toBe(false);
    });

    it('should restrict Viewer to read-only actions', async () => {
      const perms = await rolesService.resolvePermissions('org-1', 'viewer');
      expect(rolesService.checkPermission(perms, Permission.WORKFLOW_READ)).toBe(true);
      expect(rolesService.checkPermission(perms, Permission.WORKFLOW_CREATE)).toBe(false);
      expect(rolesService.checkPermission(perms, Permission.WORKFLOW_EXECUTE)).toBe(false);
    });
  });

  describe('2. Custom Roles & System Role Protection', () => {
    it('should allow creating a custom role with designated permissions', async () => {
      mockRoleModel.findOne.mockResolvedValue(null);

      const customRole = await rolesService.createCustomRole('org-1', 'user-admin', {
        name: 'AI Specialist',
        permissions: [Permission.AI_READ, Permission.AI_EXECUTE, Permission.AI_MANAGE],
      });

      expect(customRole.name).toBe('AI Specialist');
      expect(customRole.permissions).toContain(Permission.AI_MANAGE);
    });

    it('should prevent deleting system roles', async () => {
      mockRoleModel.findOne.mockResolvedValue({
        _id: 'role-admin',
        name: 'Admin',
        isSystemRole: true,
      });

      await expect(rolesService.deleteCustomRole('org-1', 'role-admin', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should prevent deleting a custom role currently assigned to active members', async () => {
      mockRoleModel.findOne.mockResolvedValue({
        _id: 'role-custom-in-use',
        name: 'In Use Role',
        isSystemRole: false,
      });
      mockMemberModel.countDocuments.mockResolvedValue(3); // 3 members assigned

      await expect(
        rolesService.deleteCustomRole('org-1', 'role-custom-in-use', 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('3. Owner Protection Rules', () => {
    it('should prevent an organization Owner from removing themselves', async () => {
      mockMemberModel.findOne.mockResolvedValue({
        _id: 'member-owner-1',
        userId: 'user-owner-1',
        role: OrganizationRole.OWNER,
      });

      await expect(
        orgService.removeMember('org-1', 'user-owner-1', 'member-owner-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent removing the last remaining organization Owner', async () => {
      mockMemberModel.findOne
        .mockResolvedValueOnce({ _id: 'caller-admin', userId: 'user-admin', role: OrganizationRole.ADMIN })
        .mockResolvedValueOnce({ _id: 'target-owner', userId: 'user-owner-2', role: OrganizationRole.OWNER });

      mockMemberModel.countDocuments.mockResolvedValue(1); // Only 1 owner remaining

      await expect(
        orgService.removeMember('org-1', 'user-admin', 'target-owner'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent non-owners from elevating other members to Owner', async () => {
      mockMemberModel.findOne
        .mockResolvedValueOnce({ _id: 'caller-admin', userId: 'user-admin', role: OrganizationRole.ADMIN })
        .mockResolvedValueOnce({ _id: 'target-member', userId: 'user-2', role: OrganizationRole.MEMBER });

      await expect(
        orgService.updateMemberRole('org-1', 'user-admin', 'target-member', OrganizationRole.OWNER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('4. Token-Based Invitation Lifecycle', () => {
    it('should generate expiring invitation token and dispatch invitation email', async () => {
      mockMemberModel.findOne.mockResolvedValue({
        _id: 'caller-admin',
        userId: 'user-admin',
        role: OrganizationRole.ADMIN,
      });
      mockOrgModel.findOne.mockResolvedValue({ _id: 'org-1', name: 'Acme Corp', isDeleted: false });

      const result = await orgService.createInvitation('org-1', 'user-admin', {
        email: 'newhire@company.com',
        role: OrganizationRole.MANAGER,
      });

      expect(result.message).toContain('Invitation successfully sent');
      expect(mockEmailService.sendInvitationEmail).toHaveBeenCalled();
    });

    it('should accept valid invitation and add user as organization member', async () => {
      mockInviteModel.findOne.mockResolvedValue({
        _id: 'invite-1',
        organizationId: 'org-1',
        email: 'alex@co.com',
        role: OrganizationRole.MANAGER,
        status: 'pending',
        expiresAt: new Date(Date.now() + 50000),
        save: jest.fn().mockResolvedValue(true),
      });

      mockMemberModel.findOne.mockResolvedValue(null); // Not already a member

      const result = await orgService.acceptInvitation('user-1', 'valid-raw-token');
      expect(result.success).toBe(true);
      expect(result.role).toBe(OrganizationRole.MANAGER);
      expect(mockMemberModel).toHaveBeenCalledWith(
        expect.objectContaining({ role: OrganizationRole.MANAGER }),
      );
    });

    it('should reject accepting an expired or invalid invitation token', async () => {
      mockInviteModel.findOne.mockResolvedValue(null);

      await expect(
        orgService.acceptInvitation('user-1', 'expired-or-invalid-token'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
