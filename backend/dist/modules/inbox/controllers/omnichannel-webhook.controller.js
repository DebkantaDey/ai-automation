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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnichannelWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const whatsapp_service_1 = require("../services/whatsapp.service");
const email_channel_service_1 = require("../services/email-channel.service");
const inbox_service_1 = require("../services/inbox.service");
const tenant_decorators_1 = require("../../../core/tenancy/tenant.decorators");
let OmnichannelWebhookController = class OmnichannelWebhookController {
    whatsappService;
    emailService;
    inboxService;
    constructor(whatsappService, emailService, inboxService) {
        this.whatsappService = whatsappService;
        this.emailService = emailService;
        this.inboxService = inboxService;
    }
    verifyWhatsApp(mode, token, challenge) {
        return this.whatsappService.verifyWebhook(mode, token, challenge);
    }
    async handleWhatsAppInbound(body, orgIdHeader) {
        const orgId = orgIdHeader || body?.organizationId || 'default-org';
        const parsedMessages = this.whatsappService.parseInboundWebhook(body);
        for (const msg of parsedMessages) {
            await this.inboxService.processInboundMessage(orgId, {
                channel: 'whatsapp',
                senderIdentifier: msg.from,
                senderName: msg.senderName,
                content: msg.text || '[Media Attachment]',
                externalMessageId: msg.messageId,
                rawPayload: msg.rawPayload,
            });
        }
        return { status: 'EVENT_RECEIVED' };
    }
    async handleEmailInbound(body, orgIdHeader) {
        const orgId = orgIdHeader || body?.organizationId || 'default-org';
        const parsed = this.emailService.parseInboundEmail(body);
        await this.inboxService.processInboundMessage(orgId, {
            channel: 'email',
            senderIdentifier: parsed.fromEmail,
            senderName: parsed.fromName,
            content: `${parsed.subject ? `Subject: ${parsed.subject}\n\n` : ''}${parsed.text}`,
            externalMessageId: parsed.messageId,
            rawPayload: parsed.rawPayload,
        });
        return { status: 'EMAIL_RECEIVED' };
    }
};
exports.OmnichannelWebhookController = OmnichannelWebhookController;
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Get)('whatsapp'),
    (0, swagger_1.ApiOperation)({ summary: 'Meta WhatsApp webhook verification challenge' }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], OmnichannelWebhookController.prototype, "verifyWhatsApp", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('whatsapp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Meta WhatsApp inbound webhook message receiver' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-organization-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OmnichannelWebhookController.prototype, "handleWhatsAppInbound", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Inbound Email webhook receiver' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-organization-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OmnichannelWebhookController.prototype, "handleEmailInbound", null);
exports.OmnichannelWebhookController = OmnichannelWebhookController = __decorate([
    (0, swagger_1.ApiTags)('Omnichannel Inbound Webhooks'),
    (0, common_1.Controller)('webhooks/omnichannel'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsAppService,
        email_channel_service_1.EmailChannelService,
        inbox_service_1.InboxService])
], OmnichannelWebhookController);
//# sourceMappingURL=omnichannel-webhook.controller.js.map