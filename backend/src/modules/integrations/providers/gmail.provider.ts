import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IntegrationProvider,
  DecryptedCredentials,
  AccountInfo,
  ActionResult,
} from '../integration.interface';

@Injectable()
export class GmailIntegrationProvider implements IntegrationProvider {
  readonly providerName = 'gmail';
  private readonly logger = new Logger(GmailIntegrationProvider.name);

  async getAccount(credentials: DecryptedCredentials): Promise<AccountInfo> {
    return {
      accountName: 'Gmail Integration',
      accountEmail: credentials.extra?.email || 'user@gmail.com',
    };
  }

  async executeAction(
    action: string,
    params: any,
    credentials: DecryptedCredentials,
  ): Promise<ActionResult> {
    if (action === 'send_email') {
      const { to, subject, body } = params;

      if (!to || !subject) {
        throw new Error('Recipient (to) and subject are required for Gmail send_email');
      }

      // Encode RFC 2822 email message to base64url
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body || '',
      ].join('\r\n');

      const raw = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      try {
        const res = await axios.post(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          { raw },
          { headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` } },
        );
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error?.message || err.message };
      }
    }

    throw new Error(`Unsupported Gmail action: [${action}]`);
  }

  async validateConnection(credentials: DecryptedCredentials): Promise<boolean> {
    return Boolean(credentials.accessToken || credentials.apiKey);
  }
}
