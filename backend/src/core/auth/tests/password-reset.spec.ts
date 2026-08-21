import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from '../auth.service';

describe('AuthService - Password Management', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockAuthTokenModel: any;
  let mockRefreshTokenModel: any;
  let mockEmailService: any;

  beforeEach(() => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    mockAuthTokenModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));
    mockAuthTokenModel.findOne = jest.fn();
    mockAuthTokenModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    mockRefreshTokenModel = {
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    mockEmailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
      sendSecurityAlertEmail: jest.fn().mockResolvedValue(true),
    };

    authService = new AuthService(
      mockUserModel,
      {} as any,
      {} as any,
      {} as any,
      mockRefreshTokenModel,
      mockAuthTokenModel,
      {} as any,
      {} as any,
      mockEmailService,
    );
  });

  it('should generate reset token and dispatch email when user requests forgot password', async () => {
    mockUserModel.findOne.mockResolvedValue({
      _id: 'user-1',
      email: 'alex@company.com',
      firstName: 'Alex',
      status: 'active',
    });

    const result = await authService.forgotPassword({ email: 'alex@company.com' });

    expect(result.message).toContain('password reset link has been sent');
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
  });

  it('should reset password with valid single-use token and revoke active sessions', async () => {
    const rawToken = 'valid-reset-token';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const mockUser = {
      _id: 'user-1',
      email: 'alex@company.com',
      firstName: 'Alex',
      passwordHash: 'old-hash',
      save: jest.fn().mockResolvedValue(true),
    };
    mockUserModel.findOne.mockResolvedValue(mockUser);

    const mockAuthToken = {
      userId: 'user-1',
      tokenHash,
      type: 'password_reset',
      isUsed: false,
      expiresAt: new Date(Date.now() + 50000),
      save: jest.fn().mockResolvedValue(true),
    };
    mockAuthTokenModel.findOne.mockResolvedValue(mockAuthToken);

    const result = await authService.resetPassword({
      email: 'alex@company.com',
      token: rawToken,
      newPassword: 'NewSecretPassword123!',
      confirmNewPassword: 'NewSecretPassword123!',
    });

    expect(result.message).toContain('Password has been reset successfully');
    expect(mockAuthToken.isUsed).toBe(true);
    expect(mockRefreshTokenModel.updateMany).toHaveBeenCalledWith(
      { userId: 'user-1' },
      { $set: { isRevoked: true } },
    );
    expect(mockEmailService.sendSecurityAlertEmail).toHaveBeenCalled();
  });

  it('should reject reset password if tokens do not match or token is already used', async () => {
    mockUserModel.findOne.mockResolvedValue({ _id: 'user-1', email: 'alex@company.com' });
    mockAuthTokenModel.findOne.mockResolvedValue(null);

    await expect(
      authService.resetPassword({
        email: 'alex@company.com',
        token: 'invalid-token',
        newPassword: 'NewSecretPassword123!',
        confirmNewPassword: 'NewSecretPassword123!',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
