import { BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';

describe('AuthService - Registration', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockOrgModel: any;
  let mockMemberModel: any;
  let mockWorkspaceModel: any;
  let mockRefreshTokenModel: any;
  let mockAuthTokenModel: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockUserModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'user-123',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockUserModel.findOne = jest.fn();

    mockOrgModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'org-123',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockOrgModel.findOne = jest.fn().mockResolvedValue(null);

    mockMemberModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'member-123',
      save: jest.fn().mockResolvedValue(true),
    }));

    mockWorkspaceModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'ws-123',
      save: jest.fn().mockResolvedValue(true),
    }));

    mockRefreshTokenModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));

    mockAuthTokenModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));
    mockAuthTokenModel.findOne = jest.fn();

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue({
        jwtSecret: 'test-secret',
        jwtExpiresIn: '15m',
      }),
    };

    mockEmailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
      sendSecurityAlertEmail: jest.fn().mockResolvedValue(true),
    };

    authService = new AuthService(
      mockUserModel,
      mockOrgModel,
      mockMemberModel,
      mockWorkspaceModel,
      mockRefreshTokenModel,
      mockAuthTokenModel,
      mockJwtService,
      mockConfigService,
      mockEmailService,
    );
  });

  it('should successfully register a new user, organization, workspace, and send verification email', async () => {
    mockUserModel.findOne.mockResolvedValue(null);

    const result = await authService.register({
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'alex@company.com',
      password: 'SecretPassword123!',
      confirmPassword: 'SecretPassword123!',
      organizationName: 'Acme Corp',
    });

    expect(result.user.email).toBe('alex@company.com');
    expect(result.organization.name).toBe('Acme Corp');
    expect(result.workspace.name).toBe('Default Workspace');
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
      'alex@company.com',
      'Alex',
      expect.any(String),
    );
  });

  it('should reject registration if passwords do not match', async () => {
    await expect(
      authService.register({
        firstName: 'Alex',
        email: 'alex@company.com',
        password: 'SecretPassword123!',
        confirmPassword: 'DifferentPassword123!',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject registration if email already exists', async () => {
    mockUserModel.findOne.mockResolvedValue({ email: 'alex@company.com' });

    await expect(
      authService.register({
        firstName: 'Alex',
        email: 'alex@company.com',
        password: 'SecretPassword123!',
        confirmPassword: 'SecretPassword123!',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
