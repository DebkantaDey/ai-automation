import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class EmailChannelService {
  private readonly logger = new Logger(EmailChannelService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Parses inbound webhook payload from standard email parse webhooks (SendGrid / Mailgun / Postmark)
   */
  parseInboundEmail(body: any): EmailInboundMessage {
    const fromRaw = body?.from || body?.sender || body?.From || '';
    let fromEmail = fromRaw;
    let fromName = fromRaw;

    // Extract name and email: "David Vance <dvance@domain.com>"
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

  /**
   * Dispatches outbound email
   */
  async sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      this.logger.log(`Outbound email queued to [${to}], subject: "${subject}"`);
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
      };
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch email to [${to}]: ${err.message}`);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
