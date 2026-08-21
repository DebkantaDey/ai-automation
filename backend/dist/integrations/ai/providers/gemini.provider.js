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
var GeminiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let GeminiProvider = GeminiProvider_1 = class GeminiProvider {
    configService;
    providerName = 'gemini';
    client = null;
    logger = new common_1.Logger(GeminiProvider_1.name);
    defaultModel = 'gemini-1.5-pro';
    constructor(configService) {
        this.configService = configService;
        const aiConfig = this.configService.get('ai');
        if (aiConfig?.geminiApiKey) {
            this.client = new generative_ai_1.GoogleGenerativeAI(aiConfig.geminiApiKey);
        }
        if (aiConfig?.geminiDefaultModel) {
            this.defaultModel = aiConfig.geminiDefaultModel;
        }
    }
    ensureClient() {
        if (!this.client) {
            const apiKey = this.configService.get('ai.geminiApiKey') || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your environment.');
            }
            this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        return this.client;
    }
    async generateChat(messages, options = {}) {
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
    async generateCompletion(prompt, options = {}) {
        return this.generateChat([{ role: 'user', content: prompt }], options);
    }
    async *generateStream(messages, options = {}) {
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
    async generateEmbeddings(texts, options = {}) {
        const client = this.ensureClient();
        const modelName = options.model || 'text-embedding-004';
        const model = client.getGenerativeModel({ model: modelName });
        const embeddings = [];
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
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = GeminiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiProvider);
//# sourceMappingURL=gemini.provider.js.map