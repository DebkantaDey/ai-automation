import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from '../auth.service';

describe('AuthService - Email Verification', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockAuthTokenModel: any;
  let mockRefreshTokenModel: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockUserModel = {
      findOne: jest.fn(),
    };

    mockAuthTokenModel = {
      findOne: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    mockRefreshTokenModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-verified-token'),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue({
        jwtSecret: 'test-secret',
        jwtExpiresIn: '15m',
      }),
    };

    mockEmailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
    };

    authService = new AuthService(
      mockUserModel,
      {} as any,
      {} as any,
      {} as any,
      mockRefreshTokenModel,
      mockAuthTokenModel,
      mockJwtService,
      mockConfigService,
      mockEmailService,
    );
  });

  it('should verify email with valid single-use token and activate user account', async () => {
    const rawToken = 'valid-email-token';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const mockUser = {
      _id: 'user-1',
      email: 'alex@company.com',
      firstName: 'Alex',
      lastName: 'Morgan',
      emailVerified: false,
      status: 'pending',
      save: jest.fn().mockResolvedValue(true),
    };
    mockUserModel.findOne.mockResolvedValue(mockUser);

    const mockAuthToken = {
      userId: 'user-1',
      tokenHash,
      type: 'email_verification',
      isUsed: false,
      expiresAt: new Date(Date.now() + 50000),
      save: jest.fn().mockResolvedValue(true),
    };
    mockAuthTokenModel.findOne.mockResolvedValue(mockAuthToken);

    const result = await authService.verifyEmail({
      email: 'alex@company.com',
      token: rawToken,
    });

    expect(result.message).toContain('successfully verified');
    expect(mockUser.emailVerified).toBe(true);
    expect(mockUser.status).toBe('active');
    expect(mockAuthToken.isUsed).toBe(true);
    expect(result.tokens).toBeDefined();
  });

  it('should reject email verification with expired or invalid token', async () => {
    mockUserModel.findOne.mockResolvedValue({ _id: 'user-1', email: 'alex@company.com' });
    mockAuthTokenModel.findOne.mockResolvedValue(null);

    await expect(
      authService.verifyEmail({
        email: 'alex@company.com',
        token: 'expired-or-invalid',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
