import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IntegrationProvider,
  DecryptedCredentials,
  AccountInfo,
  ActionResult,
} from '../integration.interface';

@Injectable()
export class GoogleSheetsIntegrationProvider implements IntegrationProvider {
  readonly providerName = 'google_sheets';
  private readonly logger = new Logger(GoogleSheetsIntegrationProvider.name);

  async getAccount(credentials: DecryptedCredentials): Promise<AccountInfo> {
    return {
      accountName: 'Google Sheets Integration',
      accountEmail: credentials.extra?.email || 'sheets@google.com',
    };
  }

  async executeAction(
    action: string,
    params: any,
    credentials: DecryptedCredentials,
  ): Promise<ActionResult> {
    const spreadsheetId = params.spreadsheetId;
    const range = params.range || 'Sheet1!A:Z';
    const values = params.values || [];

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required for Google Sheets actions');
    }

    if (action === 'append_row') {
      try {
        const res = await axios.post(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
          { values: Array.isArray(values[0]) ? values : [values] },
          { headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` } },
        );
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error?.message || err.message };
      }
    }

    if (action === 'read_rows') {
      try {
        const res = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
          { headers: { Authorization: `Bearer ${credentials.accessToken || credentials.apiKey}` } },
        );
        return { success: true, data: res.data?.values || [] };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error?.message || err.message };
      }
    }

    throw new Error(`Unsupported Google Sheets action: [${action}]`);
  }

  async validateConnection(credentials: DecryptedCredentials): Promise<boolean> {
    return Boolean(credentials.accessToken || credentials.apiKey);
  }
}
