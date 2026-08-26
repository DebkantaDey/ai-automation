import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Verifies Meta WhatsApp webhook subscription challenge
   */
  verifyWebhook(mode: string, token: string, challenge: string, expectedToken?: string): string {
    const configuredToken =
      expectedToken ||
      this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN') ||
      'automa_webhook_verify_token_2026';

    if (mode === 'subscribe' && token === configuredToken) {
      this.logger.log('WhatsApp Webhook verification challenge accepted');
      return challenge;
    }

    this.logger.warn(`WhatsApp Webhook verification failed. Token mismatch.`);
    throw new BadRequestException('Webhook verification token mismatch');
  }

  /**
   * Parses inbound webhook payload received from Meta WhatsApp Cloud API
   */
  parseInboundWebhook(body: any): WhatsAppInboundMessage[] {
    const results: WhatsAppInboundMessage[] = [];

    try {
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0]?.value;

      if (!changes) return results;

      const contacts = changes.contacts || [];
      const contactMap = new Map<string, string>();
      contacts.forEach((c: any) => {
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
        } else if (type === 'button') {
          text = msg.button?.text || '';
        } else if (type === 'interactive') {
          text = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
        } else if (['image', 'document', 'audio', 'video'].includes(type)) {
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
    } catch (err: any) {
      this.logger.error(`Error parsing WhatsApp webhook payload: ${err.message}`, err.stack);
    }

    return results;
  }

  /**
   * Dispatches outbound text or template message via Meta WhatsApp Cloud API
   */
  async sendTextMessage(
    phoneNumberId: string,
    accessToken: string,
    recipientPhoneNumber: string,
    messageText: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const cleanPhone = recipientPhoneNumber.replace(/\D/g, '');
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: false, body: messageText },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const messageId = response.data?.messages?.[0]?.id;
      this.logger.log(`WhatsApp message dispatched to [${cleanPhone}], msgId: [${messageId}]`);

      return {
        success: true,
        messageId,
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message;
      this.logger.warn(`WhatsApp dispatch to [${recipientPhoneNumber}] failed: ${errMsg}`);
      return {
        success: false,
        error: errMsg,
      };
    }
  }
}
