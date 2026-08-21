import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IntegrationProvider,
  DecryptedCredentials,
  AccountInfo,
  ActionResult,
  OAuthTokens,
} from '../integration.interface';

@Injectable()
export class SlackIntegrationProvider implements IntegrationProvider {
  readonly providerName = 'slack';
  private readonly logger = new Logger(SlackIntegrationProvider.name);

  getAuthorizeUrl(state: string): string {
    const clientId = process.env.SLACK_CLIENT_ID || 'slack_client_id_placeholder';
    const redirectUri = encodeURIComponent(
      process.env.SLACK_REDIRECT_URI || 'http://localhost:4000/api/v1/integrations/oauth/slack/callback',
    );
    const scope = encodeURIComponent('chat:write,channels:read,incoming-webhook');
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
  }

  async authenticate(code: string): Promise<OAuthTokens> {
    const clientId = process.env.SLACK_CLIENT_ID || 'slack_client_id_placeholder';
    const clientSecret = process.env.SLACK_CLIENT_SECRET || 'slack_client_secret_placeholder';
    const redirectUri = process.env.SLACK_REDIRECT_URI || 'http://localhost:4000/api/v1/integrations/oauth/slack/callback';

    try {
      const res = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      if (!res.data.ok) {
        throw new Error(res.data.error || 'Slack OAuth exchange failed');
      }

      return {
        accessToken: res.data.access_token,
        scopes: res.data.scope?.split(','),
        accountName: res.data.team?.name,
        teamId: res.data.team?.id,
        botId: res.data.bot_user_id,
      };
    } catch (err: any) {
      this.logger.error(`Slack OAuth error: ${err.message}`);
      throw new Error(`Slack authentication failed: ${err.message}`);
    }
  }

  async getAccount(credentials: DecryptedCredentials): Promise<AccountInfo> {
    if (credentials.webhookUrl) {
      return {
        accountName: 'Slack Incoming Webhook',
        metadata: { webhookUrl: credentials.webhookUrl.replace(/^(.{25}).*$/, '$1...') },
      };
    }

    try {
      const res = await axios.get('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });
      return {
        accountId: res.data.user_id,
        accountName: res.data.team,
        metadata: { user: res.data.user, url: res.data.url },
      };
    } catch {
      return { accountName: 'Slack Integration' };
    }
  }

  async executeAction(
    action: string,
    params: any,
    credentials: DecryptedCredentials,
  ): Promise<ActionResult> {
    if (action === 'send_message' || action === 'post_webhook') {
      const text = params.text || params.message || 'Notification from Automation SaaS';
      const channel = params.channel;

      if (credentials.webhookUrl) {
        const res = await axios.post(credentials.webhookUrl, { text, channel });
        return { success: true, data: res.data };
      }

      if (credentials.accessToken) {
        const res = await axios.post(
          'https://slack.com/api/chat.postMessage',
          { channel: channel || '#general', text },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } },
        );
        return { success: res.data.ok, data: res.data, error: res.data.error };
      }

      throw new Error('No Slack credentials or Webhook URL configured');
    }

    throw new Error(`Unsupported Slack action: [${action}]`);
  }

  async validateConnection(credentials: DecryptedCredentials): Promise<boolean> {
    if (credentials.webhookUrl) {
      return credentials.webhookUrl.startsWith('https://hooks.slack.com/');
    }
    if (credentials.accessToken) {
      try {
        const res = await axios.get('https://slack.com/api/auth.test', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
        });
        return res.data?.ok === true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
