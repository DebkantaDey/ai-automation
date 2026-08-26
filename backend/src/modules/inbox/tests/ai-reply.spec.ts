import { Test, TestingModule } from '@nestjs/testing';
import { AiReplyGeneratorService } from '../services/ai-reply-generator.service';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';

describe('AiReplyGeneratorService', () => {
  let service: AiReplyGeneratorService;
  let mockAiGateway: any;

  beforeEach(async () => {
    mockAiGateway = {
      structuredOutput: jest.fn().mockResolvedValue({
        data: {
          replyText: 'Hello David! We have booked your demo for tomorrow at 2:00 PM.',
          confidence: 0.96,
          reasoning: 'Customer asked for demo slot confirmation',
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiReplyGeneratorService,
        { provide: AiGatewayService, useValue: mockAiGateway },
      ],
    }).compile();

    service = module.get<AiReplyGeneratorService>(AiReplyGeneratorService);
  });

  it('should generate AI reply draft with confidence rating', async () => {
    const mockConv: any = {
      _id: 'conv-1',
      contactName: 'David Vance',
      channel: 'whatsapp',
      contactIdentifier: '+1 (555) 234-5678',
    };

    const mockMessages: any = [
      { senderName: 'David', senderType: 'customer', content: 'Can we meet tomorrow at 2 PM?' },
    ];

    const result = await service.generateReply(mockConv, mockMessages, { company: 'Global Logistics' });

    expect(result).toBeDefined();
    expect(result.replyText).toContain('demo for tomorrow');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('should return safe fallback draft if AI gateway throws', async () => {
    mockAiGateway.structuredOutput.mockRejectedValue(new Error('AI Gateway Error'));

    const mockConv: any = {
      _id: 'conv-1',
      contactName: 'David Vance',
      channel: 'email',
      contactIdentifier: 'dvance@logistics.com',
    };

    const result = await service.generateReply(mockConv, []);

    expect(result).toBeDefined();
    expect(result.replyText).toContain('David Vance');
    expect(result.confidence).toBe(0.7);
  });
});
