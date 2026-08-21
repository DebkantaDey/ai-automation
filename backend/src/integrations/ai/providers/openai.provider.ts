import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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
export class OpenAiProvider implements AiProviderInterface {
  readonly providerName = 'openai';
  private client: OpenAI | null = null;
  private readonly logger = new Logger(OpenAiProvider.name);
  private defaultModel = 'gpt-4o';

  constructor(private readonly configService: ConfigService) {
    const aiConfig = this.configService.get<AiConfig>('ai');
    if (aiConfig?.openaiApiKey) {
      this.client = new OpenAI({ apiKey: aiConfig.openaiApiKey });
    }
    if (aiConfig?.openaiDefaultModel) {
      this.defaultModel = aiConfig.openaiDefaultModel;
    }
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('ai.openaiApiKey') || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment.');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async generateChat(messages: ChatMessage[], options: CompletionOptions = {}): Promise<AiCompletionResult> {
    const client = this.ensureClient();
    const model = options.model || this.defaultModel;

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map((m) => ({
      role: m.role as any,
      content: m.content,
      name: m.name,
    }));

    if (options.systemPrompt && !messages.some((m) => m.role === 'system')) {
      formattedMessages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const response = await client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      stop: options.stop,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });

    const choice = response.choices[0];
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      text: choice?.message?.content || '',
      model: response.model,
      provider: this.providerName,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      finishReason: choice?.finish_reason,
      raw: response,
    };
  }

  async generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<AiCompletionResult> {
    return this.generateChat([{ role: 'user', content: prompt }], options);
  }

  async *generateStream(messages: ChatMessage[], options: CompletionOptions = {}): AsyncIterable<AiStreamChunk> {
    const client = this.ensureClient();
    const model = options.model || this.defaultModel;

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map((m) => ({
      role: m.role as any,
      content: m.content,
      name: m.name,
    }));

    if (options.systemPrompt && !messages.some((m) => m.role === 'system')) {
      formattedMessages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const stream = await client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      const finish = !!chunk.choices[0]?.finish_reason;
      yield {
        deltaText: delta,
        isFinished: finish,
      };
    }
  }

  async generateEmbeddings(texts: string[], options: { model?: string } = {}): Promise<AiEmbeddingResult> {
    const client = this.ensureClient();
    const model = options.model || 'text-embedding-3-small';

    const response = await client.embeddings.create({
      model,
      input: texts,
    });

    return {
      embeddings: response.data.map((d) => d.embedding),
      model: response.model,
      provider: this.providerName,
      usage: {
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }
}
