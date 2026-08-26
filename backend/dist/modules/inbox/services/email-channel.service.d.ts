import { ConfigService } from '@nestjs/config';
export interface EmailInboundMessage {
    fromEmail: string;
    fromName: string;
    toEmail: string;
    subject: string;
    text: string;
    html?: string;
    messageId: string;
    rawPayload: any;
}
export declare class EmailChannelService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    parseInboundEmail(body: any): EmailInboundMessage;
    sendEmail(to: string, subject: string, content: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
