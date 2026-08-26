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
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    configService;
    logger = new common_1.Logger(WhatsAppService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    verifyWebhook(mode, token, challenge, expectedToken) {
        const configuredToken = expectedToken ||
            this.configService.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') ||
            'automa_webhook_verify_token_2026';
        if (mode === 'subscribe' && token === configuredToken) {
            this.logger.log('WhatsApp Webhook verification challenge accepted');
            return challenge;
        }
        this.logger.warn(`WhatsApp Webhook verification failed. Token mismatch.`);
        throw new common_1.BadRequestException('Webhook verification token mismatch');
    }
    parseInboundWebhook(body) {
        const results = [];
        try {
            const entry = body?.entry?.[0];
            const changes = entry?.changes?.[0]?.value;
            if (!changes)
                return results;
            const contacts = changes.contacts || [];
            const contactMap = new Map();
            contacts.forEach((c) => {
                contactMap.set(c.wa_id, c.profile?.name || c.wa_id);
            });
            const messages = changes.messages || [];
            for (const msg of messages) {
                const from = msg.from;
                const senderName = contactMap.get(from) || from;
                const messageId = msg.id;
                const timestamp = msg.timestamp;
                const type = msg.type;
                let text = '';
                let mediaUrl = '';
                if (type === 'text') {
                    text = msg.text?.body || '';
                }
                else if (type === 'button') {
                    text = msg.button?.text || '';
                }
                else if (type === 'interactive') {
                    text = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
                }
                else if (['image', 'document', 'audio', 'video'].includes(type)) {
                    text = msg[type]?.caption || `[${type} attachment]`;
                    mediaUrl = msg[type]?.id || '';
                }
                results.push({
                    from,
                    senderName,
                    messageId,
                    timestamp,
                    type,
                    text,
                    mediaUrl,
                    rawPayload: msg,
                });
            }
        }
        catch (err) {
            this.logger.error(`Error parsing WhatsApp webhook payload: ${err.message}`, err.stack);
        }
        return results;
    }
    async sendTextMessage(phoneNumberId, accessToken, recipientPhoneNumber, messageText) {
        try {
            const cleanPhone = recipientPhoneNumber.replace(/\D/g, '');
            const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
            const response = await axios_1.default.post(url, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanPhone,
                type: 'text',
                text: { preview_url: false, body: messageText },
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            const messageId = response.data?.messages?.[0]?.id;
            this.logger.log(`WhatsApp message dispatched to [${cleanPhone}], msgId: [${messageId}]`);
            return {
                success: true,
                messageId,
            };
        }
        catch (err) {
            const errMsg = err.response?.data?.error?.message || err.message;
            this.logger.warn(`WhatsApp dispatch to [${recipientPhoneNumber}] failed: ${errMsg}`);
            return {
                success: false,
                error: errMsg,
            };
        }
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map