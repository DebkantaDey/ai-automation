import { ConfigService } from '@nestjs/config';
export interface WhatsAppInboundMessage {
    from: string;
    senderName: string;
    messageId: string;
    timestamp: string;
    type: string;
    text?: string;
    mediaUrl?: string;
    rawPayload: any;
}
export declare class WhatsAppService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    verifyWebhook(mode: string, token: string, challenge: string, expectedToken?: string): string;
    parseInboundWebhook(body: any): WhatsAppInboundMessage[];
    sendTextMessage(phoneNumberId: string, accessToken: string, recipientPhoneNumber: string, messageText: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
