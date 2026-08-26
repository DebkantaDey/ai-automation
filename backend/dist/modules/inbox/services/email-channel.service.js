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
var EmailChannelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailChannelService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EmailChannelService = EmailChannelService_1 = class EmailChannelService {
    configService;
    logger = new common_1.Logger(EmailChannelService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    parseInboundEmail(body) {
        const fromRaw = body?.from || body?.sender || body?.From || '';
        let fromEmail = fromRaw;
        let fromName = fromRaw;
        const match = fromRaw.match(/(.*)<(.+)>/);
        if (match) {
            fromName = match[1].trim();
            fromEmail = match[2].trim();
        }
        const toEmail = body?.to || body?.recipient || body?.To || '';
        const subject = body?.subject || body?.Subject || '(No Subject)';
        const text = body?.text || body?.plain || body?.body || body?.['body-plain'] || '';
        const html = body?.html || body?.['body-html'] || '';
        const messageId = body?.['Message-Id'] || body?.['message-id'] || `email_${Date.now()}`;
        return {
            fromEmail,
            fromName,
            toEmail,
            subject,
            text,
            html,
            messageId,
            rawPayload: body,
        };
    }
    async sendEmail(to, subject, content) {
        try {
            this.logger.log(`Outbound email queued to [${to}], subject: "${subject}"`);
            return {
                success: true,
                messageId: `msg_${Date.now()}`,
            };
        }
        catch (err) {
            this.logger.warn(`Failed to dispatch email to [${to}]: ${err.message}`);
            return {
                success: false,
                error: err.message,
            };
        }
    }
};
exports.EmailChannelService = EmailChannelService;
exports.EmailChannelService = EmailChannelService = EmailChannelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailChannelService);
//# sourceMappingURL=email-channel.service.js.map