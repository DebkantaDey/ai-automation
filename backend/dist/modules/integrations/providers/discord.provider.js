"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DiscordIntegrationProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordIntegrationProvider = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let DiscordIntegrationProvider = DiscordIntegrationProvider_1 = class DiscordIntegrationProvider {
    providerName = 'discord';
    logger = new common_1.Logger(DiscordIntegrationProvider_1.name);
    async getAccount(credentials) {
        return {
            accountName: 'Discord Webhook Channel',
            metadata: { webhookUrl: credentials.webhookUrl?.replace(/^(.{30}).*$/, '$1...') },
        };
    }
    async executeAction(action, params, credentials) {
        const webhookUrl = credentials.webhookUrl;
        if (!webhookUrl) {
            throw new Error('Discord Webhook URL is required');
        }
        if (action === 'send_message' || action === 'post_webhook') {
            const content = params.content || params.text || params.message || 'Automated message from AI SaaS';
            const username = params.username || 'AI Automation Bot';
            const embeds = params.embeds;
            try {
                const res = await axios_1.default.post(webhookUrl, {
                    content,
                    username,
                    embeds,
                });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.message || err.message };
            }
        }
        throw new Error(`Unsupported Discord action: [${action}]`);
    }
    async validateConnection(credentials) {
        return Boolean(credentials.webhookUrl?.startsWith('https://discord.com/api/webhooks/'));
    }
};
exports.DiscordIntegrationProvider = DiscordIntegrationProvider;
exports.DiscordIntegrationProvider = DiscordIntegrationProvider = DiscordIntegrationProvider_1 = __decorate([
    (0, common_1.Injectable)()
], DiscordIntegrationProvider);
//# sourceMappingURL=discord.provider.js.map