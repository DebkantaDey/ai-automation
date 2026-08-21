import { PrivacyService } from '../privacy.service';

describe('Privacy, Data Export & Cascading Deletion Engine (Module 81)', () => {
  let privacyService: PrivacyService;

  let mockConsentModel: any;
  let mockUserModel: any;
  let mockOrgModel: any;
  let mockMembershipModel: any;
  let mockWorkspaceModel: any;
  let mockWorkflowModel: any;
  let mockExecutionModel: any;
  let mockApiKeyModel: any;
  let mockDocumentModel: any;
  let mockChunkModel: any;
  let mockIntegrationModel: any;
  let mockWebhookModel: any;
  let mockSubscriptionModel: any;
  let mockAuditLogModel: any;

  beforeEach(() => {
    mockConsentModel = {
      findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ analyticsConsent: true, marketingConsent: false }) }),
      findOneAndUpdate: jest.fn().mockResolvedValue({ analyticsConsent: true, marketingConsent: true }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };

    mockUserModel = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'user-123',
          email: 'jane@enterprise.com',
          firstName: 'Jane',
          lastName: 'Doe',
          password: 'hashed-secret-pwd',
        }),
      }),
      findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'user-123' }),
    };

    mockOrgModel = {
      findById: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue({ _id: 'org-123', name: 'Acme Corp', slug: 'acme' }),
        _id: 'org-123',
        name: 'Acme Corp',
      })),
      findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'org-123' }),
    };

    mockMembershipModel = {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ role: 'owner', organizationId: { name: 'Acme Corp' } }]),
        }),
      }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 3 }),
    };

    mockWorkspaceModel = {
      find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ name: 'Default', slug: 'default' }]) }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }),
    };

    mockWorkflowModel = {
      find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ name: 'Lead Pipeline' }]) }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 5 }),
    };

    mockExecutionModel = {
      find: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ status: 'completed' }]),
        }),
      }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 140 }),
    };

    mockApiKeyModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ name: 'Prod Key', keyPrefix: 'ak_live_7...' }]),
        }),
      }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }),
    };

    mockDocumentModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ title: 'API Spec.pdf' }]),
        }),
      }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 4 }),
    };

    mockChunkModel = { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 38 }) };
    mockIntegrationModel = { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 3 }) };
    mockWebhookModel = { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }) };
    mockSubscriptionModel = {
      findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ plan: 'business', status: 'active' }) }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    mockAuditLogModel = { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 89 }) };

    privacyService = new PrivacyService(
      mockConsentModel,
      mockUserModel,
      mockOrgModel,
      mockMembershipModel,
      mockWorkspaceModel,
      mockWorkflowModel,
      mockExecutionModel,
      mockApiKeyModel,
      mockDocumentModel,
      mockChunkModel,
      mockIntegrationModel,
      mockWebhookModel,
      mockSubscriptionModel,
      mockAuditLogModel,
    );
  });

  describe('1. GDPR / CCPA Data Portability Export', () => {
    it('should export sanitized user profile package without password hash', async () => {
      const userExport = await privacyService.exportUserData('user-123');

      expect(userExport.subject).toContain('GDPR / CCPA');
      expect(userExport.profile.email).toBe('jane@enterprise.com');
      expect(userExport.profile.password).toBeUndefined(); // Crucial security check
      expect(userExport.organizationMemberships).toHaveLength(1);
    });

    it('should export full organization package with sanitized api keys', async () => {
      const orgExport = await privacyService.exportOrganizationData('org-123');

      expect(orgExport.organization.name).toBe('Acme Corp');
      expect(orgExport.workflows).toHaveLength(1);
      expect(orgExport.apiKeysConfigured).toHaveLength(1);
    });
  });

  describe('2. Right to be Forgotten (Account Deletion)', () => {
    it('should delete user record, consent preferences, and memberships', async () => {
      const result = await privacyService.deleteUserAccount('user-123');

      expect(result.success).toBe(true);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalled();
      expect(mockMembershipModel.deleteMany).toHaveBeenCalled();
      expect(mockConsentModel.deleteMany).toHaveBeenCalled();
    });
  });

  describe('3. Cascading Organization Deletion', () => {
    it('should cascade delete all linked workspaces, workflows, executions, documents, and subscriptions', async () => {
      const res = await privacyService.deleteOrganization('org-123');

      expect(res.success).toBe(true);
      expect(res.deletedCounts.workflows).toBe(5);
      expect(res.deletedCounts.executions).toBe(140);
      expect(res.deletedCounts.documents).toBe(4);
      expect(res.deletedCounts.subscriptions).toBe(1);
      expect(mockOrgModel.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  describe('4. Consent Management', () => {
    it('should persist and return updated consent records', async () => {
      const updated = await privacyService.updateConsent('user-123', {
        analyticsConsent: true,
        marketingConsent: true,
      });

      expect(updated.marketingConsent).toBe(true);
      expect(mockConsentModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
