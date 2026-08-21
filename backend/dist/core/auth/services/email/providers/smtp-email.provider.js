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
var SmtpEmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpEmailProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let SmtpEmailProvider = SmtpEmailProvider_1 = class SmtpEmailProvider {
    configService;
    providerName = 'smtp';
    transporter = null;
    fromAddress;
    logger = new common_1.Logger(SmtpEmailProvider_1.name);
    constructor(configService) {
        this.configService = configService;
        const host = this.configService.get('EMAIL_HOST') || process.env.EMAIL_HOST;
        const port = parseInt(this.configService.get('EMAIL_PORT') || process.env.EMAIL_PORT || '587', 10);
        const user = this.configService.get('EMAIL_USER') || process.env.EMAIL_USER;
        const pass = this.configService.get('EMAIL_PASSWORD') || process.env.EMAIL_PASSWORD;
        this.fromAddress = this.configService.get('EMAIL_FROM') || process.env.EMAIL_FROM || 'noreply@automa.ai';
        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
        }
    }
    async sendEmail(message) {
        if (!this.transporter) {
            this.logger.warn(`SMTP credentials not configured. Falling back to logger.`);
            return false;
        }
        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to: message.to,
                subject: message.subject,
                html: message.html,
                text: message.text,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email via SMTP: ${error.message}`);
            return false;
        }
    }
};
exports.SmtpEmailProvider = SmtpEmailProvider;
exports.SmtpEmailProvider = SmtpEmailProvider = SmtpEmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmtpEmailProvider);
//# sourceMappingURL=smtp-email.provider.js.map