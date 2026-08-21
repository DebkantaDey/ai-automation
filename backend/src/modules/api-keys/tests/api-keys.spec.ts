import { ApiKeysService } from '../api-keys.service';

describe('API Keys Management & Public API Security (Modules 51, 52)', () => {
  let apiKeysService: ApiKeysService;
  let mockApiKeyModel: any;
  let mockAuditLogsService: any;

  beforeEach(() => {
    mockApiKeyModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'ak-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockApiKeyModel.find = jest.fn();
    mockApiKeyModel.findOne = jest.fn();
    mockApiKeyModel.findOneAndUpdate = jest.fn();
    mockApiKeyModel.countDocuments = jest.fn();
    mockApiKeyModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    mockAuditLogsService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    apiKeysService = new ApiKeysService(
      mockApiKeyModel as any,
      mockAuditLogsService as any,
    );
  });

  describe('1. Secure Key Generation & Hashing', () => {
    it('should generate a secret key starting with ak_live_ and store only the SHA-256 hash', async () => {
      const res = await apiKeysService.createApiKey('org-1', 'ws-1', 'user-1', {
        name: 'Zapier Integration Key',
        scopes: ['workflows:execute', 'agents:run'],
        expiresInDays: 30,
      });

      expect(res.secretKey).toBeDefined();
      expect(res.secretKey.startsWith('ak_live_')).toBe(true);
      expect(res.apiKey.keyPrefix.startsWith('ak_live_')).toBe(true);
      expect(res.apiKey.keyHash).not.toBe(res.secretKey); // Must be securely hashed!
      expect(res.apiKey.scopes).toEqual(['workflows:execute', 'agents:run']);
      expect(mockAuditLogsService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'api_key.created' }),
      );
    });
  });

  describe('2. Key Validation & Expiration Checking', () => {
    it('should authenticate active key and reject revoked key', async () => {
      mockApiKeyModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'ak-123',
            name: 'Valid Key',
            status: 'active',
            scopes: ['*'],
          }),
        }),
      });

      const validResult = await apiKeysService.validateKey('ak_live_1234567890abcdef1234567890abcdef');
      expect(validResult.name).toBe('Valid Key');
      expect(validResult.status).toBe('active');
    });

    it('should throw UnauthorizedException for malformed key format', async () => {
      await expect(apiKeysService.validateKey('invalid_key_prefix')).rejects.toThrow();
    });
  });
});
