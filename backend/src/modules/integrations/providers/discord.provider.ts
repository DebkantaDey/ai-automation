import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IntegrationProvider,
  DecryptedCredentials,
  AccountInfo,
  ActionResult,
} from '../integration.interface';

@Injectable()
export class DiscordIntegrationProvider implements IntegrationProvider {
  readonly providerName = 'discord';
  private readonly logger = new Logger(DiscordIntegrationProvider.name);

  async getAccount(credentials: DecryptedCredentials): Promise<AccountInfo> {
    return {
      accountName: 'Discord Webhook Channel',
      metadata: { webhookUrl: credentials.webhookUrl?.replace(/^(.{30}).*$/, '$1...') },
    };
  }

  async executeAction(
    action: string,
    params: any,
    credentials: DecryptedCredentials,
  ): Promise<ActionResult> {
    const webhookUrl = credentials.webhookUrl;
    if (!webhookUrl) {
      throw new Error('Discord Webhook URL is required');
    }

    if (action === 'send_message' || action === 'post_webhook') {
      const content = params.content || params.text || params.message || 'Automated message from AI SaaS';
      const username = params.username || 'AI Automation Bot';
      const embeds = params.embeds;

      try {
        const res = await axios.post(webhookUrl, {
          content,
          username,
          embeds,
        });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.message || err.message };
      }
    }

    throw new Error(`Unsupported Discord action: [${action}]`);
  }

  async validateConnection(credentials: DecryptedCredentials): Promise<boolean> {
    return Boolean(credentials.webhookUrl?.startsWith('https://discord.com/api/webhooks/'));
  }
}
