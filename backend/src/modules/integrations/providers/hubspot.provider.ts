import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IntegrationProvider,
  DecryptedCredentials,
  AccountInfo,
  ActionResult,
} from '../integration.interface';

@Injectable()
export class HubSpotIntegrationProvider implements IntegrationProvider {
  readonly providerName = 'hubspot';
  private readonly logger = new Logger(HubSpotIntegrationProvider.name);

  async getAccount(credentials: DecryptedCredentials): Promise<AccountInfo> {
    try {
      const res = await axios.get('https://api.hubapi.com/crm/v3/info', {
        headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` },
      });
      return {
        accountName: 'HubSpot CRM Account',
        metadata: res.data,
      };
    } catch {
      return { accountName: 'HubSpot CRM' };
    }
  }

  async executeAction(
    action: string,
    params: any,
    credentials: DecryptedCredentials,
  ): Promise<ActionResult> {
    const token = credentials.accessToken || credentials.apiKey;

    if (action === 'create_contact') {
      const properties: any = {
        email: params.email,
        firstname: params.firstname || params.firstName,
        lastname: params.lastname || params.lastName,
        company: params.company,
        phone: params.phone,
      };

      try {
        const res = await axios.post(
          'https://api.hubapi.com/crm/v3/objects/contacts',
          { properties },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.message || err.message };
      }
    }

    if (action === 'get_contact') {
      try {
        const res = await axios.get(
          `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(params.email)}?idProperty=email`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.message || err.message };
      }
    }

    throw new Error(`Unsupported HubSpot action: [${action}]`);
  }

  async validateConnection(credentials: DecryptedCredentials): Promise<boolean> {
    return Boolean(credentials.accessToken || credentials.apiKey);
  }
}
