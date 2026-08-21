import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from '../auth.service';

describe('AuthService - Refresh Token Rotation & Replay Defense', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockRefreshTokenModel: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockUserModel = {
      findById: jest.fn(),
    };

    mockRefreshTokenModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));
    mockRefreshTokenModel.findOne = jest.fn();
    mockRefreshTokenModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 2 });
    mockRefreshTokenModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('new-access-token'),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue({
        jwtSecret: 'test-secret',
        jwtExpiresIn: '15m',
      }),
    };

    authService = new AuthService(
      mockUserModel,
      {} as any,
      {} as any,
      {} as any,
      mockRefreshTokenModel,
      {} as any,
      mockJwtService,
      mockConfigService,
      {} as any,
    );
  });

  it('should successfully rotate refresh token and return new token pair', async () => {
    const rawToken = 'sample-raw-refresh-token';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const existingTokenDoc = {
      userId: 'user-1',
      tokenHash,
      family: 'family-uuid-1',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 100000),
      save: jest.fn().mockResolvedValue(true),
    };

    mockRefreshTokenModel.findOne.mockResolvedValue(existingTokenDoc);
    mockUserModel.findById.mockResolvedValue({
      _id: 'user-1',
      email: 'alex@company.com',
      status: 'active',
    });

    const result = await authService.refreshToken(rawToken);

    expect(existingTokenDoc.isRevoked).toBe(true);
    expect(existingTokenDoc.save).toHaveBeenCalled();
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(rawToken);
  });

  it('should detect token replay attack and revoke entire family chain', async () => {
    const rawToken = 'reused-revoked-token';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const revokedTokenDoc = {
      userId: 'user-1',
      tokenHash,
      family: 'family-uuid-compromised',
      isRevoked: true,
      expiresAt: new Date(Date.now() + 100000),
    };

    mockRefreshTokenModel.findOne.mockResolvedValue(revokedTokenDoc);

    await expect(authService.refreshToken(rawToken)).rejects.toThrow(UnauthorizedException);
    expect(mockRefreshTokenModel.updateMany).toHaveBeenCalledWith(
      { family: 'family-uuid-compromised' },
      { $set: { isRevoked: true } },
    );
  });
});
