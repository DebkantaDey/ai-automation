export type AiRole = 'system' | 'user' | 'assistant' | 'tool';
export interface ChatMessage {
    role: AiRole;
    content: string;
    name?: string;
    toolCalls?: any[];
}
export type AiTaskType = 'generate' | 'classify' | 'extract' | 'summarize' | 'decision' | 'agent' | 'embeddings';
export interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stop?: string[];
    jsonMode?: boolean;
    systemPrompt?: string;
    planTier?: 'free' | 'starter' | 'business' | 'enterprise';
}
export interface AiUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd?: number;
}
export interface AiCompletionResult {
    text: string;
    model: string;
    provider: string;
    usage: AiUsage;
    finishReason?: string;
    raw?: any;
}
export interface AiStreamChunk {
    deltaText: string;
    isFinished: boolean;
    usage?: AiUsage;
}
export interface AiEmbeddingResult {
    embeddings: number[][];
    model: string;
    provider: string;
    usage: {
        totalTokens: number;
    };
}
export interface StructuredOutputResult<T = any> {
    data: T;
    rawText: string;
    model: string;
    provider: string;
    usage: AiUsage;
    attempts: number;
}
export interface AiProviderInterface {
    readonly providerName: string;
    generateChat(messages: ChatMessage[], options?: CompletionOptions): Promise<AiCompletionResult>;
    generateCompletion(prompt: string, options?: CompletionOptions): Promise<AiCompletionResult>;
    generateStream(messages: ChatMessage[], options?: CompletionOptions): AsyncIterable<AiStreamChunk>;
    generateEmbeddings(texts: string[], options?: {
        model?: string;
    }): Promise<AiEmbeddingResult>;
}
