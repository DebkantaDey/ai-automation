import { ConfigService } from '@nestjs/config';
import { AiCompletionResult, AiEmbeddingResult, AiProviderInterface, AiStreamChunk, ChatMessage, CompletionOptions } from '../ai.interface';
export declare class OpenAiProvider implements AiProviderInterface {
    private readonly configService;
    readonly providerName = "openai";
    private client;
    private readonly logger;
    private defaultModel;
    constructor(configService: ConfigService);
    private ensureClient;
    generateChat(messages: ChatMessage[], options?: CompletionOptions): Promise<AiCompletionResult>;
    generateCompletion(prompt: string, options?: CompletionOptions): Promise<AiCompletionResult>;
    generateStream(messages: ChatMessage[], options?: CompletionOptions): AsyncIterable<AiStreamChunk>;
    generateEmbeddings(texts: string[], options?: {
        model?: string;
    }): Promise<AiEmbeddingResult>;
}
