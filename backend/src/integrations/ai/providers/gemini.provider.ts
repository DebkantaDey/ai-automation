import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
export class GeminiProvider implements AiProviderInterface {
  readonly providerName = 'gemini';
  private client: GoogleGenerativeAI | null = null;
  private readonly logger = new Logger(GeminiProvider.name);
  private defaultModel = 'gemini-1.5-pro';

  constructor(private readonly configService: ConfigService) {
    const aiConfig = this.configService.get<AiConfig>('ai');
    if (aiConfig?.geminiApiKey) {
      this.client = new GoogleGenerativeAI(aiConfig.geminiApiKey);
    }
    if (aiConfig?.geminiDefaultModel) {
      this.defaultModel = aiConfig.geminiDefaultModel;
    }
  }

  private ensureClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('ai.geminiApiKey') || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your environment.');
      }
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  async generateChat(messages: ChatMessage[], options: CompletionOptions = {}): Promise<AiCompletionResult> {
    const client = this.ensureClient();
    const modelName = options.model || this.defaultModel;
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: options.systemPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens,
        topP: options.topP,
        stopSequences: options.stop,
        responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
      },
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage ? lastMessage.content : '';

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    const usageMetadata = response.usageMetadata;

    return {
      text,
      model: modelName,
      provider: this.providerName,
      usage: {
        promptTokens: usageMetadata?.promptTokenCount || 0,
        completionTokens: usageMetadata?.candidatesTokenCount || 0,
        totalTokens: usageMetadata?.totalTokenCount || 0,
      },
      raw: response,
    };
  }

  async generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<AiCompletionResult> {
    return this.generateChat([{ role: 'user', content: prompt }], options);
  }

  async *generateStream(messages: ChatMessage[], options: CompletionOptions = {}): AsyncIterable<AiStreamChunk> {
    const client = this.ensureClient();
    const modelName = options.model || this.defaultModel;
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: options.systemPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens,
      },
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage ? lastMessage.content : '';

    const chat = model.startChat({ history });
    const resultStream = await chat.sendMessageStream(prompt);

    for await (const chunk of resultStream.stream) {
      yield {
        deltaText: chunk.text(),
        isFinished: false,
      };
    }

    yield {
      deltaText: '',
      isFinished: true,
    };
  }

  async generateEmbeddings(texts: string[], options: { model?: string } = {}): Promise<AiEmbeddingResult> {
    const client = this.ensureClient();
    const modelName = options.model || 'text-embedding-004';
    const model = client.getGenerativeModel({ model: modelName });

    const embeddings: number[][] = [];
    for (const text of texts) {
      const result = await model.embedContent(text);
      embeddings.push(result.embedding.values);
    }

    return {
      embeddings,
      model: modelName,
      provider: this.providerName,
      usage: {
        totalTokens: texts.reduce((acc, t) => acc + Math.ceil(t.length / 4), 0),
      },
    };
  }
}
