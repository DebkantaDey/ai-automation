import { Test, TestingModule } from '@nestjs/testing';
import { LeadScoringService } from '../services/lead-scoring.service';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';

describe('LeadScoringService', () => {
  let service: LeadScoringService;
  let mockAiGateway: any;

  beforeEach(async () => {
    mockAiGateway = {
      structuredOutput: jest.fn().mockResolvedValue({
        data: {
          score: 95,
          confidence: 0.94,
          priority: 'high',
          reasons: ['Requested enterprise demo with 50+ seats', 'Verified enterprise corporate domain'],
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadScoringService,
        { provide: AiGatewayService, useValue: mockAiGateway },
      ],
    }).compile();

    service = module.get<LeadScoringService>(LeadScoringService);
  });

  it('should score lead using AI Gateway and structured output', async () => {
    const mockLead: any = {
      _id: 'lead-1',
      name: 'David Vance',
      email: 'dvance@logistics-core.com',
      company: 'Global Logistics Corp',
      source: 'whatsapp',
      notes: 'Interested in enterprise demo',
    };

    const result = await service.scoreLead(mockLead);

    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.priority).toBe('high');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should fallback gracefully to heuristics if AI gateway throws', async () => {
    mockAiGateway.structuredOutput.mockRejectedValue(new Error('AI Gateway 503'));

    const mockLead: any = {
      _id: 'lead-2',
      name: 'Dr. Emily Watson',
      email: 'dr.watson@healthclinics.org',
      company: 'HealthTech Clinics',
      source: 'whatsapp',
      notes: 'Demo required',
    };

    const result = await service.scoreLead(mockLead);

    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(50);
    expect(result.priority).toBeDefined();
    expect(result.reasons[0]).toContain('Corporate domain');
  });
});
