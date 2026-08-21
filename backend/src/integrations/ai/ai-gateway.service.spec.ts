import { ConfigService } from '@nestjs/config';
import { AiGatewayService } from './ai-gateway.service';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AnthropicProvider } from './providers/anthropic.provider';

describe('AiGatewayService - Intelligent Routing & Structured Output', () => {
  let gateway: AiGatewayService;
  let mockOpenAi: Partial<OpenAiProvider>;
  let mockGemini: Partial<GeminiProvider>;
  let mockAnthropic: Partial<AnthropicProvider>;
  let mockConfig: Partial<ConfigService>;

  beforeEach(() => {
    mockConfig = {
      get: jest.fn().mockReturnValue({ defaultProvider: 'openai' }),
    };

    mockOpenAi = {
      providerName: 'openai',
      generateCompletion: jest.fn().mockResolvedValue({
        text: 'Hello from OpenAI',
        model: 'gpt-4o',
        provider: 'openai',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
      generateChat: jest.fn().mockResolvedValue({
        text: JSON.stringify({ category: 'billing', confidence: 0.98, reason: 'Mentions invoice' }),
        model: 'gpt-4o',
        provider: 'openai',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    };

    mockGemini = {
      providerName: 'gemini',
      generateCompletion: jest.fn().mockResolvedValue({
        text: 'Hello from Gemini',
        model: 'gemini-1.5-pro',
        provider: 'gemini',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
      generateChat: jest.fn(),
    };

    mockAnthropic = {
      providerName: 'anthropic',
      generateCompletion: jest.fn(),
      generateChat: jest.fn().mockResolvedValue({
        text: 'Chat from Claude',
        model: 'claude-3-5-sonnet',
        provider: 'anthropic',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      }),
    };

    gateway = new AiGatewayService(
      mockConfig as ConfigService,
      mockOpenAi as OpenAiProvider,
      mockGemini as GeminiProvider,
      mockAnthropic as AnthropicProvider,
    );
  });

  describe('1. Intelligent Model Routing (Module 37)', () => {
    it('should route lightweight extraction/classification tasks to cost-efficient models', () => {
      const route = gateway.routeModel('classify', { planTier: 'starter' });
      expect(route.model).toBe('gpt-4o-mini');
    });

    it('should route high-reasoning agent tasks to frontier models', () => {
      const route = gateway.routeModel('agent', { provider: 'anthropic' });
      expect(route.model).toContain('claude-3-5-sonnet');
    });
  });

  describe('2. Structured AI Output Validation (Module 39)', () => {
    it('should produce validated and parsed JSON object', async () => {
      const res = await gateway.classify('I was charged twice on my card', ['billing', 'technical', 'sales']);

      expect(res.data.category).toBe('billing');
      expect(res.data.confidence).toBe(0.98);
      expect(res.attempts).toBe(1);
    });
  });
});
