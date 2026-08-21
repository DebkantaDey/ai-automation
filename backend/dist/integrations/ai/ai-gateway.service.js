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
var AiGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_provider_1 = require("./providers/openai.provider");
const gemini_provider_1 = require("./providers/gemini.provider");
const anthropic_provider_1 = require("./providers/anthropic.provider");
let AiGatewayService = AiGatewayService_1 = class AiGatewayService {
    configService;
    openAiProvider;
    geminiProvider;
    anthropicProvider;
    logger = new common_1.Logger(AiGatewayService_1.name);
    providers = new Map();
    defaultProviderName;
    constructor(configService, openAiProvider, geminiProvider, anthropicProvider) {
        this.configService = configService;
        this.openAiProvider = openAiProvider;
        this.geminiProvider = geminiProvider;
        this.anthropicProvider = anthropicProvider;
        this.providers.set('openai', this.openAiProvider);
        this.providers.set('gemini', this.geminiProvider);
        this.providers.set('anthropic', this.anthropicProvider);
        const aiConfig = this.configService.get('ai');
        this.defaultProviderName = aiConfig?.defaultProvider || 'openai';
    }
    getProvider(name) {
        const key = (name || this.defaultProviderName).toLowerCase();
        const provider = this.providers.get(key);
        if (!provider) {
            throw new common_1.NotFoundException(`AI Provider '${key}' is not registered or supported.`);
        }
        return provider;
    }
    routeModel(task, options) {
        if (options?.provider && options?.model) {
            return { provider: options.provider, model: options.model };
        }
        const planTier = options?.planTier || 'starter';
        switch (task) {
            case 'classify':
            case 'extract':
                return { provider: 'openai', model: 'gpt-4o-mini' };
            case 'summarize':
            case 'generate':
                if (planTier === 'enterprise' || planTier === 'business') {
                    return { provider: 'openai', model: 'gpt-4o' };
                }
                return { provider: 'openai', model: 'gpt-4o-mini' };
            case 'decision':
            case 'agent':
                if (options?.provider === 'anthropic') {
                    return { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' };
                }
                if (options?.provider === 'gemini') {
                    return { provider: 'gemini', model: 'gemini-1.5-pro' };
                }
                return { provider: 'openai', model: 'gpt-4o' };
            case 'embeddings':
            default:
                return { provider: 'openai', model: 'text-embedding-3-small' };
        }
    }
    resolveProviderName(options) {
        if (options?.provider) {
            return options.provider;
        }
        if (options?.task) {
            return this.routeModel(options.task, options).provider;
        }
        const model = options?.model?.toLowerCase();
        if (model) {
            if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('text-embedding')) {
                return 'openai';
            }
            if (model.startsWith('gemini')) {
                return 'gemini';
            }
            if (model.startsWith('claude')) {
                return 'anthropic';
            }
        }
        return this.defaultProviderName;
    }
    async generateChat(messages, options = {}) {
        const primaryProviderName = this.resolveProviderName(options);
        const fallbacks = options.fallbackProviders || [];
        const providerQueue = [primaryProviderName, ...fallbacks.filter((p) => p !== primaryProviderName)];
        let lastError;
        for (const providerName of providerQueue) {
            try {
                const provider = this.getProvider(providerName);
                this.logger.debug(`Dispatching AI chat request to provider [${providerName}]`);
                return await provider.generateChat(messages, options);
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`AI Provider [${providerName}] failed: ${error.message}. Attempting fallback if available...`);
            }
        }
        throw lastError || new Error('All AI providers failed to fulfill request');
    }
    async generateCompletion(prompt, options = {}) {
        return this.generateChat([{ role: 'user', content: prompt }], options);
    }
    async structuredOutput(prompt, schemaDescription, options = {}) {
        const systemPrompt = `You are a structured data extractor. You must respond ONLY with valid JSON conforming to this schema:\n${schemaDescription}\nDo not include any explanation or markdown backticks.`;
        let attempts = 0;
        const maxAttempts = 2;
        let lastErrorMsg = '';
        while (attempts < maxAttempts) {
            attempts++;
            const userMessage = attempts === 1
                ? prompt
                : `${prompt}\n\nIMPORTANT: Your previous output failed JSON parsing with error: "${lastErrorMsg}". Please fix the JSON syntax and return ONLY valid JSON.`;
            const res = await this.generateChat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ], { ...options, jsonMode: true });
            const cleaned = res.text.replace(/```json\n?|\n?```/g, '').trim();
            try {
                const parsed = JSON.parse(cleaned);
                return {
                    data: parsed,
                    rawText: res.text,
                    model: res.model,
                    provider: res.provider,
                    usage: res.usage,
                    attempts,
                };
            }
            catch (err) {
                lastErrorMsg = err.message;
                this.logger.warn(`Structured output JSON parse attempt ${attempts} failed: ${err.message}`);
                if (attempts >= maxAttempts) {
                    throw new Error(`Failed to produce valid JSON structured output after ${maxAttempts} attempts: ${err.message}`);
                }
            }
        }
        throw new Error('Structured output generation failed');
    }
    async classify(input, categories, options = {}) {
        const schema = `{ "category": "one of ${JSON.stringify(categories)}", "confidence": "0.0 to 1.0 number", "reason": "brief reason" }`;
        const prompt = `Classify this text into one of the allowed categories:\n\nInput: "${input}"`;
        return this.structuredOutput(prompt, schema, { ...options, task: 'classify' });
    }
    async extract(input, fields, options = {}) {
        const schema = `{\n${fields.map((f) => `  "${f}": "extracted value or null"`).join(',\n')}\n}`;
        const prompt = `Extract the requested fields from this text:\n\nInput:\n${input}`;
        return this.structuredOutput(prompt, schema, { ...options, task: 'extract' });
    }
    async summarize(input, options = {}) {
        const systemPrompt = options.systemPrompt || 'You are an executive assistant. Summarize the text clearly and concisely with key action items.';
        return this.generateChat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input },
        ], { ...options, task: 'summarize' });
    }
    async decision(input, criteria, options = {}) {
        const schema = `{ "decision": "APPROVED" | "REJECTED" | "NEEDS_REVIEW", "confidence": 0.0-1.0, "reasoning": "rationale based on criteria" }`;
        const prompt = `Evaluate the following input against the decision criteria:\n\nCriteria:\n${criteria}\n\nInput:\n${input}`;
        return this.structuredOutput(prompt, schema, { ...options, task: 'decision' });
    }
    async *generateStream(messages, options = {}) {
        const providerName = this.resolveProviderName(options);
        const provider = this.getProvider(providerName);
        yield* provider.generateStream(messages, options);
    }
    async generateEmbeddings(texts, options = {}) {
        const providerName = options.provider || 'openai';
        const provider = this.getProvider(providerName);
        return provider.generateEmbeddings(texts, options);
    }
    getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
};
exports.AiGatewayService = AiGatewayService;
exports.AiGatewayService = AiGatewayService = AiGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        openai_provider_1.OpenAiProvider,
        gemini_provider_1.GeminiProvider,
        anthropic_provider_1.AnthropicProvider])
], AiGatewayService);
//# sourceMappingURL=ai-gateway.service.js.map