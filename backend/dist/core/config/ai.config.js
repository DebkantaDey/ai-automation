"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('ai', () => ({
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'openai',
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiDefaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiDefaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-pro',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicDefaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokensPerRequest: parseInt(process.env.AI_MAX_TOKENS_PER_REQUEST || '4096', 10),
}));
//# sourceMappingURL=ai.config.js.map