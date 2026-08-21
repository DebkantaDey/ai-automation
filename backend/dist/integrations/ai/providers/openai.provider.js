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
var OpenAiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
let OpenAiProvider = OpenAiProvider_1 = class OpenAiProvider {
    configService;
    providerName = 'openai';
    client = null;
    logger = new common_1.Logger(OpenAiProvider_1.name);
    defaultModel = 'gpt-4o';
    constructor(configService) {
        this.configService = configService;
        const aiConfig = this.configService.get('ai');
        if (aiConfig?.openaiApiKey) {
            this.client = new openai_1.default({ apiKey: aiConfig.openaiApiKey });
        }
        if (aiConfig?.openaiDefaultModel) {
            this.defaultModel = aiConfig.openaiDefaultModel;
        }
    }
    ensureClient() {
        if (!this.client) {
            const apiKey = this.configService.get('ai.openaiApiKey') || process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment.');
            }
            this.client = new openai_1.default({ apiKey });
        }
        return this.client;
    }
    async generateChat(messages, options = {}) {
        const client = this.ensureClient();
        const model = options.model || this.defaultModel;
        const formattedMessages = messages.map((m) => ({
            role: m.role,
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
    async generateCompletion(prompt, options = {}) {
        return this.generateChat([{ role: 'user', content: prompt }], options);
    }
    async *generateStream(messages, options = {}) {
        const client = this.ensureClient();
        const model = options.model || this.defaultModel;
        const formattedMessages = messages.map((m) => ({
            role: m.role,
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
    async generateEmbeddings(texts, options = {}) {
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
};
exports.OpenAiProvider = OpenAiProvider;
exports.OpenAiProvider = OpenAiProvider = OpenAiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAiProvider);
//# sourceMappingURL=openai.provider.js.map