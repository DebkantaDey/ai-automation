import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from '../auth.service';

describe('AuthService - Login & Account Status', () => {
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

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    mockOrgModel = {
      findById: jest.fn().mockResolvedValue({ _id: 'org-1', name: 'Acme Org', slug: 'acme-org', plan: 'pro' }),
    };

    mockMemberModel = {
      findOne: jest.fn().mockResolvedValue({ role: 'owner' }),
    };

    mockWorkspaceModel = {
      findById: jest.fn().mockResolvedValue({ _id: 'ws-1', name: 'Default Workspace', slug: 'default' }),
    };

    mockRefreshTokenModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));

    mockAuthTokenModel = {};

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('valid-access-token'),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue({
        jwtSecret: 'test-secret',
        jwtExpiresIn: '15m',
      }),
    };

    mockEmailService = {};

    authService = new AuthService(
      mockUserModel as any,
      mockOrgModel as any,
      mockMemberModel as any,
      mockWorkspaceModel as any,
      mockRefreshTokenModel as any,
      mockAuthTokenModel as any,
      mockJwtService,
      mockConfigService,
      mockEmailService,
    );
  });

  it('should authenticate user with valid credentials and return tokens', async () => {
    const passwordHash = await argon2.hash('Secret123!');
    const mockUser = {
      _id: 'user-1',
      email: 'alex@company.com',
      firstName: 'Alex',
      lastName: 'Morgan',
      passwordHash,
      status: 'active',
      emailVerified: true,
      defaultOrganizationId: 'org-1',
      defaultWorkspaceId: 'ws-1',
      authProviders: [],
      save: jest.fn().mockResolvedValue(true),
    };

    mockUserModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
    });

    const result = await authService.login({
      email: 'alex@company.com',
      password: 'Secret123!',
    });

    expect(result.tokens.accessToken).toBe('valid-access-token');
    expect(result.user.email).toBe('alex@company.com');
  });

  it('should reject login with generic error if user does not exist', async () => {
    mockUserModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      authService.login({
        email: 'unknown@company.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login if password does not match', async () => {
    const passwordHash = await argon2.hash('CorrectPassword123!');
    const mockUser = {
      _id: 'user-1',
      email: 'alex@company.com',
      passwordHash,
      status: 'active',
    };

    mockUserModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
    });

    await expect(
      authService.login({
        email: 'alex@company.com',
        password: 'WrongPassword123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should block suspended user accounts', async () => {
    const passwordHash = await argon2.hash('Secret123!');
    const mockUser = {
      _id: 'user-1',
      email: 'alex@company.com',
      passwordHash,
      status: 'suspended',
    };

    mockUserModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
    });

    await expect(
      authService.login({
        email: 'alex@company.com',
        password: 'Secret123!',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
