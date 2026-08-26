import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from '../services/whatsapp.service';
import { BadRequestException } from '@nestjs/common';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('valid_token_123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
  });

  it('should accept valid Meta webhook challenge', () => {
    const challenge = service.verifyWebhook('subscribe', 'valid_token_123', 'challenge_abc123');
    expect(challenge).toBe('challenge_abc123');
  });

  it('should throw BadRequestException on invalid challenge token', () => {
    expect(() =>
      service.verifyWebhook('subscribe', 'wrong_token', 'challenge_abc123'),
    ).toThrow(BadRequestException);
  });

  it('should parse Meta WhatsApp inbound payload', () => {
    const mockPayload = {
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: '15552345678', profile: { name: 'David Vance' } }],
                messages: [
                  {
                    from: '15552345678',
                    id: 'wamid.HBgLMjM0...',
                    timestamp: '1724580000',
                    type: 'text',
                    text: { body: 'Hello! I need a demo.' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const parsed = service.parseInboundWebhook(mockPayload);
    expect(parsed.length).toBe(1);
    expect(parsed[0].from).toBe('15552345678');
    expect(parsed[0].senderName).toBe('David Vance');
    expect(parsed[0].text).toBe('Hello! I need a demo.');
  });
});
