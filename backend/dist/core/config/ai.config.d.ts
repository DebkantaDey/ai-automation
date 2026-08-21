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
declare const _default: (() => AiConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AiConfig>;
export default _default;
