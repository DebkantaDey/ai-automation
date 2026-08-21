"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GmailIntegrationProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailIntegrationProvider = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let GmailIntegrationProvider = GmailIntegrationProvider_1 = class GmailIntegrationProvider {
    providerName = 'gmail';
    logger = new common_1.Logger(GmailIntegrationProvider_1.name);
    async getAccount(credentials) {
        return {
            accountName: 'Gmail Integration',
            accountEmail: credentials.extra?.email || 'user@gmail.com',
        };
    }
    async executeAction(action, params, credentials) {
        if (action === 'send_email') {
            const { to, subject, body } = params;
            if (!to || !subject) {
                throw new Error('Recipient (to) and subject are required for Gmail send_email');
            }
            const emailContent = [
                `To: ${to}`,
                `Subject: ${subject}`,
                'Content-Type: text/html; charset=utf-8',
                '',
                body || '',
            ].join('\r\n');
            const raw = Buffer.from(emailContent)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            try {
                const res = await axios_1.default.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { raw }, { headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` } });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error?.message || err.message };
            }
        }
        throw new Error(`Unsupported Gmail action: [${action}]`);
    }
    async validateConnection(credentials) {
        return Boolean(credentials.accessToken || credentials.apiKey);
    }
};
exports.GmailIntegrationProvider = GmailIntegrationProvider;
exports.GmailIntegrationProvider = GmailIntegrationProvider = GmailIntegrationProvider_1 = __decorate([
    (0, common_1.Injectable)()
], GmailIntegrationProvider);
//# sourceMappingURL=gmail.provider.js.map