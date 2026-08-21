import { ConfigService } from '@nestjs/config';
import { AiCompletionResult, AiEmbeddingResult, AiProviderInterface, AiStreamChunk, AiTaskType, ChatMessage, CompletionOptions, StructuredOutputResult } from './ai.interface';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
export interface AiGatewayOptions extends CompletionOptions {
    provider?: 'openai' | 'gemini' | 'anthropic';
    fallbackProviders?: ('openai' | 'gemini' | 'anthropic')[];
    task?: AiTaskType;
}
export declare class AiGatewayService {
    private readonly configService;
    private readonly openAiProvider;
    private readonly geminiProvider;
    private readonly anthropicProvider;
    private readonly logger;
    private readonly providers;
    private defaultProviderName;
    constructor(configService: ConfigService, openAiProvider: OpenAiProvider, geminiProvider: GeminiProvider, anthropicProvider: AnthropicProvider);
    getProvider(name?: string): AiProviderInterface;
    routeModel(task: AiTaskType, options?: AiGatewayOptions): {
        provider: 'openai' | 'gemini' | 'anthropic';
        model: string;
    };
    private resolveProviderName;
    generateChat(messages: ChatMessage[], options?: AiGatewayOptions): Promise<AiCompletionResult>;
    generateCompletion(prompt: string, options?: AiGatewayOptions): Promise<AiCompletionResult>;
    structuredOutput<T = any>(prompt: string, schemaDescription: string, options?: AiGatewayOptions): Promise<StructuredOutputResult<T>>;
    classify(input: string, categories: string[], options?: AiGatewayOptions): Promise<StructuredOutputResult<{
        category: string;
        confidence: number;
        reason: string;
    }>>;
    extract<T = Record<string, any>>(input: string, fields: string[], options?: AiGatewayOptions): Promise<StructuredOutputResult<T>>;
    summarize(input: string, options?: AiGatewayOptions): Promise<AiCompletionResult>;
    decision(input: string, criteria: string, options?: AiGatewayOptions): Promise<StructuredOutputResult<{
        decision: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
        confidence: number;
        reasoning: string;
    }>>;
    generateStream(messages: ChatMessage[], options?: AiGatewayOptions): AsyncIterable<AiStreamChunk>;
    generateEmbeddings(texts: string[], options?: {
        provider?: string;
        model?: string;
    }): Promise<AiEmbeddingResult>;
    getAvailableProviders(): string[];
}
