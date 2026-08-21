import { registerAs } from '@nestjs/config';

export interface AiConfig {
  defaultProvider: 'openai' | 'gemini' | 'anthropic';
  openaiApiKey?: string;
  openaiDefaultModel: string;
  geminiApiKey?: string;
  geminiDefaultModel: string;
  anthropicApiKey?: string;
  anthropicDefaultModel: string;
  maxTokensPerRequest: number;
}

export default registerAs('ai', (): AiConfig => ({
  defaultProvider: (process.env.AI_DEFAULT_PROVIDER as 'openai' | 'gemini' | 'anthropic') || 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiDefaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiDefaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-pro',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicDefaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokensPerRequest: parseInt(process.env.AI_MAX_TOKENS_PER_REQUEST || '4096', 10),
}));
