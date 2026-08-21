import { EncryptionService } from '../../../core/security/encryption.service';
import { IntegrationsService } from '../integrations.service';
import { SlackIntegrationProvider } from '../providers/slack.provider';
import { GoogleSheetsIntegrationProvider } from '../providers/google-sheets.provider';
import { GmailIntegrationProvider } from '../providers/gmail.provider';
import { HubSpotIntegrationProvider } from '../providers/hubspot.provider';
import { DiscordIntegrationProvider } from '../providers/discord.provider';

describe('Generic Integration Framework & AES-256-GCM Credential Manager', () => {
  let encryptionService: EncryptionService;
  let integrationsService: IntegrationsService;
  let mockConnectionModel: any;

  beforeEach(() => {
    encryptionService = new EncryptionService();

    mockConnectionModel = jest.fn().mockImplementation(function (data) {
      Object.assign(this, data, { _id: 'conn-123' });
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockConnectionModel.find = jest.fn();
    mockConnectionModel.findById = jest.fn();
    mockConnectionModel.deleteOne = jest.fn();

    const slackProvider = new SlackIntegrationProvider();
    const sheetsProvider = new GoogleSheetsIntegrationProvider();
    const gmailProvider = new GmailIntegrationProvider();
    const hubspotProvider = new HubSpotIntegrationProvider();
    const discordProvider = new DiscordIntegrationProvider();

    integrationsService = new IntegrationsService(
      mockConnectionModel as any,
      encryptionService,
      slackProvider,
      sheetsProvider,
      gmailProvider,
      hubspotProvider,
      discordProvider,
    );
  });

  describe('1. AES-256-GCM Symmetrical Encryption Engine', () => {
    it('should encrypt plaintext into encryptedData, IV, and authenticated tag', () => {
      const secretToken = 'xoxb-1234567890-slack-bot-token';
      const encrypted = encryptionService.encrypt(secretToken);

      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.encryptedData).not.toBe(secretToken);
      expect(encrypted.iv).toHaveLength(24); // 12 bytes in hex
      expect(encrypted.tag).toHaveLength(32); // 16 bytes in hex
    });

    it('should accurately decrypt encrypted payload back to original plaintext', () => {
      const secretApiKey = 'hubspot_pat_secret_998877';
      const encrypted = encryptionService.encrypt(secretApiKey);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(secretApiKey);
    });

    it('should throw error if encrypted payload authentication tag is tampered with', () => {
      const encrypted = encryptionService.encrypt('secret');
      encrypted.tag = '00000000000000000000000000000000'; // Forged auth tag

      expect(() => encryptionService.decrypt(encrypted)).toThrow();
    });
  });

  describe('2. Integrations Service & Provider Orchestration', () => {
    it('should return complete catalog of available connectors', () => {
      const catalog = integrationsService.getAvailableCatalog();
      expect(catalog.length).toBeGreaterThanOrEqual(5);
      expect(catalog.some((c) => c.id === 'slack')).toBe(true);
      expect(catalog.some((c) => c.id === 'google_sheets')).toBe(true);
      expect(catalog.some((c) => c.id === 'hubspot')).toBe(true);
    });

    it('should connect API key integration with encrypted credentials at rest', async () => {
      const conn = await integrationsService.connectWithApiKey('org-1', 'ws-1', 'user-1', {
        provider: 'hubspot',
        name: 'Production HubSpot CRM',
        apiKey: 'pat-eu1-12345-secret',
      });

      expect(conn.status).toBe('connected');
      expect(conn.credentials.encryptedAccessToken).toBeDefined();
      expect(conn.credentials.encryptedAccessToken).not.toBe('pat-eu1-12345-secret');
      expect(conn.credentials.iv).toBeDefined();
      expect(conn.credentials.tag).toBeDefined();
    });

    it('should accurately retrieve and decrypt credentials for execution', async () => {
      const originalApiKey = 'pat-na1-secure-token';
      const encrypted = encryptionService.encrypt(originalApiKey);

      const mockDoc: any = {
        _id: 'conn-1',
        provider: 'hubspot',
        status: 'connected',
        credentials: {
          encryptedAccessToken: encrypted.encryptedData,
          iv: encrypted.iv,
          tag: encrypted.tag,
        },
        metadata: { accountName: 'HubSpot' },
      };

      mockConnectionModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockDoc),
        }),
      });

      const { credentials } = await integrationsService.getDecryptedCredentials('conn-1');
      expect(credentials.accessToken).toBe(originalApiKey);
    });
  });
});
