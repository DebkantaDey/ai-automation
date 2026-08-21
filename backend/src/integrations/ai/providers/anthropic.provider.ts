import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {
  AiCompletionResult,
  AiEmbeddingResult,
  AiProviderInterface,
  AiStreamChunk,
  ChatMessage,
  CompletionOptions,
} from '../ai.interface';
import { AiConfig } from '../../../core/config/ai.config';

@Injectable()
export class AnthropicProvider implements AiProviderInterface {
  readonly providerName = 'anthropic';
  private client: Anthropic | null = null;
  private readonly logger = new Logger(AnthropicProvider.name);
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor(private readonly configService: ConfigService) {
    const aiConfig = this.configService.get<AiConfig>('ai');
    if (aiConfig?.anthropicApiKey) {
      this.client = new Anthropic({ apiKey: aiConfig.anthropicApiKey });
    }
    if (aiConfig?.anthropicDefaultModel) {
      this.defaultModel = aiConfig.anthropicDefaultModel;
    }
  }

  private ensureClient(): Anthropic {
    if (!this.client) {
      const apiKey = this.configService.get<string>('ai.anthropicApiKey') || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment.');
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async generateChat(messages: ChatMessage[], options: CompletionOptions = {}): Promise<AiCompletionResult> {
    const client = this.ensureClient();
    const model = options.model || this.defaultModel;

    let systemPrompt = options.systemPrompt;
    const userMessages: Anthropic.MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        userMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      }
    }

    const response = await client.messages.create({
      model,
      system: systemPrompt,
      messages: userMessages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      stop_sequences: options.stop,
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    return {
      text,
      model: response.model,
      provider: this.providerName,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      raw: response,
    };
  }

  async generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<AiCompletionResult> {
    return this.generateChat([{ role: 'user', content: prompt }], options);
  }

  async *generateStream(messages: ChatMessage[], options: CompletionOptions = {}): AsyncIterable<AiStreamChunk> {
    const client = this.ensureClient();
    const model = options.model || this.defaultModel;

    let systemPrompt = options.systemPrompt;
    const userMessages: Anthropic.MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        userMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      }
    }

    const stream = await client.messages.create({
      model,
      system: systemPrompt,
      messages: userMessages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield {
          deltaText: event.delta.text,
          isFinished: false,
        };
      }
    }

    yield {
      deltaText: '',
      isFinished: true,
    };
  }

  async generateEmbeddings(texts: string[], options: { model?: string } = {}): Promise<AiEmbeddingResult> {
    // Anthropic does not have a native embeddings endpoint; fall back to an informative error or proxy
    throw new Error('Anthropic does not offer native embeddings API. Please use OpenAI or Gemini provider for embeddings.');
  }
}
