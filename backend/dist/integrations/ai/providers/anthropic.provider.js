"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AnthropicProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@anthropic-ai/sdk");
let AnthropicProvider = AnthropicProvider_1 = class AnthropicProvider {
    configService;
    providerName = 'anthropic';
    client = null;
    logger = new common_1.Logger(AnthropicProvider_1.name);
    defaultModel = 'claude-3-5-sonnet-20241022';
    constructor(configService) {
        this.configService = configService;
        const aiConfig = this.configService.get('ai');
        if (aiConfig?.anthropicApiKey) {
            this.client = new sdk_1.default({ apiKey: aiConfig.anthropicApiKey });
        }
        if (aiConfig?.anthropicDefaultModel) {
            this.defaultModel = aiConfig.anthropicDefaultModel;
        }
    }
    ensureClient() {
        if (!this.client) {
            const apiKey = this.configService.get('ai.anthropicApiKey') || process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                throw new Error('Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment.');
            }
            this.client = new sdk_1.default({ apiKey });
        }
        return this.client;
    }
    async generateChat(messages, options = {}) {
        const client = this.ensureClient();
        const model = options.model || this.defaultModel;
        let systemPrompt = options.systemPrompt;
        const userMessages = [];
        for (const msg of messages) {
            if (msg.role === 'system') {
                systemPrompt = msg.content;
            }
            else {
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
            .map((block) => block.text)
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
    async generateCompletion(prompt, options = {}) {
        return this.generateChat([{ role: 'user', content: prompt }], options);
    }
    async *generateStream(messages, options = {}) {
        const client = this.ensureClient();
        const model = options.model || this.defaultModel;
        let systemPrompt = options.systemPrompt;
        const userMessages = [];
        for (const msg of messages) {
            if (msg.role === 'system') {
                systemPrompt = msg.content;
            }
            else {
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
    async generateEmbeddings(texts, options = {}) {
        throw new Error('Anthropic does not offer native embeddings API. Please use OpenAI or Gemini provider for embeddings.');
    }
};
exports.AnthropicProvider = AnthropicProvider;
exports.AnthropicProvider = AnthropicProvider = AnthropicProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AnthropicProvider);
//# sourceMappingURL=anthropic.provider.js.map