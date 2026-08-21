import { ConfigService } from '@nestjs/config';
import { EmailMessage, EmailProviderInterface } from '../email.interface';
export declare class SmtpEmailProvider implements EmailProviderInterface {
    private readonly configService;
    readonly providerName = "smtp";
    private transporter;
    private fromAddress;
    private readonly logger;
    constructor(configService: ConfigService);
    sendEmail(message: EmailMessage): Promise<boolean>;
}
