import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiCompletionResult,
  AiEmbeddingResult,
  AiProviderInterface,
  AiStreamChunk,
  AiTaskType,
  ChatMessage,
  CompletionOptions,
  StructuredOutputResult,
} from './ai.interface';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { AiConfig } from '../../core/config/ai.config';

export interface AiGatewayOptions extends CompletionOptions {
  provider?: 'openai' | 'gemini' | 'anthropic';
  fallbackProviders?: ('openai' | 'gemini' | 'anthropic')[];
  task?: AiTaskType;
}

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly providers = new Map<string, AiProviderInterface>();
  private defaultProviderName: 'openai' | 'gemini' | 'anthropic';

  constructor(
    private readonly configService: ConfigService,
    private readonly openAiProvider: OpenAiProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly anthropicProvider: AnthropicProvider,
  ) {
    this.providers.set('openai', this.openAiProvider);
    this.providers.set('gemini', this.geminiProvider);
    this.providers.set('anthropic', this.anthropicProvider);

    const aiConfig = this.configService.get<AiConfig>('ai');
    this.defaultProviderName = aiConfig?.defaultProvider || 'openai';
  }

  public getProvider(name?: string): AiProviderInterface {
    const key = (name || this.defaultProviderName).toLowerCase();
    const provider = this.providers.get(key);
    if (!provider) {
      throw new NotFoundException(`AI Provider '${key}' is not registered or supported.`);
    }
    return provider;
  }

  /**
   * Intelligently selects model & provider based on task complexity, cost, and plan tier (Module 37)
   */
  public routeModel(task: AiTaskType, options?: AiGatewayOptions): { provider: 'openai' | 'gemini' | 'anthropic'; model: string } {
    if (options?.provider && options?.model) {
      return { provider: options.provider, model: options.model };
    }

    const planTier = options?.planTier || 'starter';

    switch (task) {
      case 'classify':
      case 'extract':
        // Fast, cost-efficient models for structured extraction/classification
        return { provider: 'openai', model: 'gpt-4o-mini' };

      case 'summarize':
      case 'generate':
        if (planTier === 'enterprise' || planTier === 'business') {
          return { provider: 'openai', model: 'gpt-4o' };
        }
        return { provider: 'openai', model: 'gpt-4o-mini' };

      case 'decision':
      case 'agent':
        // High-reasoning frontier models for autonomous agent loops and multi-step decisions
        if (options?.provider === 'anthropic') {
          return { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' };
        }
        if (options?.provider === 'gemini') {
          return { provider: 'gemini', model: 'gemini-1.5-pro' };
        }
        return { provider: 'openai', model: 'gpt-4o' };

      case 'embeddings':
      default:
        return { provider: 'openai', model: 'text-embedding-3-small' };
    }
  }

  private resolveProviderName(options?: AiGatewayOptions): string {
    if (options?.provider) {
      return options.provider;
    }

    if (options?.task) {
      return this.routeModel(options.task, options).provider;
    }

    const model = options?.model?.toLowerCase();
    if (model) {
      if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('text-embedding')) {
        return 'openai';
      }
      if (model.startsWith('gemini')) {
        return 'gemini';
      }
      if (model.startsWith('claude')) {
        return 'anthropic';
      }
    }

    return this.defaultProviderName;
  }

  async generateChat(messages: ChatMessage[], options: AiGatewayOptions = {}): Promise<AiCompletionResult> {
    const primaryProviderName = this.resolveProviderName(options);
    const fallbacks = options.fallbackProviders || [];
    const providerQueue = [primaryProviderName, ...fallbacks.filter((p) => p !== primaryProviderName)];

    let lastError: any;

    for (const providerName of providerQueue) {
      try {
        const provider = this.getProvider(providerName);
        this.logger.debug(`Dispatching AI chat request to provider [${providerName}]`);
        return await provider.generateChat(messages, options);
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`AI Provider [${providerName}] failed: ${error.message}. Attempting fallback if available...`);
      }
    }

    throw lastError || new Error('All AI providers failed to fulfill request');
  }

  async generateCompletion(prompt: string, options: AiGatewayOptions = {}): Promise<AiCompletionResult> {
    return this.generateChat([{ role: 'user', content: prompt }], options);
  }

  /**
   * Generates strictly validated JSON structured output with automatic repair & retry (Module 39)
   */
  async structuredOutput<T = any>(
    prompt: string,
    schemaDescription: string,
    options: AiGatewayOptions = {},
  ): Promise<StructuredOutputResult<T>> {
    const systemPrompt = `You are a structured data extractor. You must respond ONLY with valid JSON conforming to this schema:\n${schemaDescription}\nDo not include any explanation or markdown backticks.`;

    let attempts = 0;
    const maxAttempts = 2;
    let lastErrorMsg = '';

    while (attempts < maxAttempts) {
      attempts++;
      const userMessage = attempts === 1
        ? prompt
        : `${prompt}\n\nIMPORTANT: Your previous output failed JSON parsing with error: "${lastErrorMsg}". Please fix the JSON syntax and return ONLY valid JSON.`;

      const res = await this.generateChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        { ...options, jsonMode: true },
      );

      const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();

      try {
        const parsed = JSON.parse(cleaned);
        return {
          data: parsed as T,
          rawText: res.text,
          model: res.model,
          provider: res.provider,
          usage: res.usage,
          attempts,
        };
      } catch (err: any) {
        lastErrorMsg = err.message;
        this.logger.warn(`Structured output JSON parse attempt ${attempts} failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to produce valid JSON structured output after ${maxAttempts} attempts: ${err.message}`);
        }
      }
    }

    throw new Error('Structured output generation failed');
  }

  /**
   * High-Level Task: Classification (Module 38)
   */
  async classify(input: string, categories: string[], options: AiGatewayOptions = {}): Promise<StructuredOutputResult<{ category: string; confidence: number; reason: string }>> {
    const schema = `{ "category": "one of ${JSON.stringify(categories)}", "confidence": "0.0 to 1.0 number", "reason": "brief reason" }`;
    const prompt = `Classify this text into one of the allowed categories:\n\nInput: "${input}"`;
    return this.structuredOutput(prompt, schema, { ...options, task: 'classify' });
  }

  /**
   * High-Level Task: Entity Extraction (Module 38)
   */
  async extract<T = Record<string, any>>(input: string, fields: string[], options: AiGatewayOptions = {}): Promise<StructuredOutputResult<T>> {
    const schema = `{\n${fields.map((f) => `  "${f}": "extracted value or null"`).join(',\n')}\n}`;
    const prompt = `Extract the requested fields from this text:\n\nInput:\n${input}`;
    return this.structuredOutput<T>(prompt, schema, { ...options, task: 'extract' });
  }

  /**
   * High-Level Task: Summarization (Module 38)
   */
  async summarize(input: string, options: AiGatewayOptions = {}): Promise<AiCompletionResult> {
    const systemPrompt = options.systemPrompt || 'You are an executive assistant. Summarize the text clearly and concisely with key action items.';
    return this.generateChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      { ...options, task: 'summarize' },
    );
  }

  /**
   * High-Level Task: Structured Decision Making (Module 38)
   */
  async decision(
    input: string,
    criteria: string,
    options: AiGatewayOptions = {},
  ): Promise<StructuredOutputResult<{ decision: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW'; confidence: number; reasoning: string }>> {
    const schema = `{ "decision": "APPROVED" | "REJECTED" | "NEEDS_REVIEW", "confidence": 0.0-1.0, "reasoning": "rationale based on criteria" }`;
    const prompt = `Evaluate the following input against the decision criteria:\n\nCriteria:\n${criteria}\n\nInput:\n${input}`;
    return this.structuredOutput(prompt, schema, { ...options, task: 'decision' });
  }

  async *generateStream(messages: ChatMessage[], options: AiGatewayOptions = {}): AsyncIterable<AiStreamChunk> {
    const providerName = this.resolveProviderName(options);
    const provider = this.getProvider(providerName);
    yield* provider.generateStream(messages, options);
  }

  async generateEmbeddings(texts: string[], options: { provider?: string; model?: string } = {}): Promise<AiEmbeddingResult> {
    const providerName = options.provider || 'openai';
    const provider = this.getProvider(providerName);
    return provider.generateEmbeddings(texts, options);
  }

  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
