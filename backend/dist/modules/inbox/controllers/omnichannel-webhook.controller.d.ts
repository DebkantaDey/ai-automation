import { WhatsAppService } from '../services/whatsapp.service';
import { EmailChannelService } from '../services/email-channel.service';
import { InboxService } from '../services/inbox.service';
export declare class OmnichannelWebhookController {
    private readonly whatsappService;
    private readonly emailService;
    private readonly inboxService;
    constructor(whatsappService: WhatsAppService, emailService: EmailChannelService, inboxService: InboxService);
    verifyWhatsApp(mode: string, token: string, challenge: string): string;
    handleWhatsAppInbound(body: any, orgIdHeader?: string): Promise<{
        status: string;
    }>;
    handleEmailInbound(body: any, orgIdHeader?: string): Promise<{
        status: string;
    }>;
}
