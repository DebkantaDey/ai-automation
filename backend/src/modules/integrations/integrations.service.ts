import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IntegrationConnection,
  IntegrationConnectionDocument,
} from './schemas/integration-connection.schema';
import {
  IntegrationProvider,
  DecryptedCredentials,
  ActionResult,
} from './integration.interface';
import { EncryptionService } from '../../core/security/encryption.service';
import { SlackIntegrationProvider } from './providers/slack.provider';
import { GoogleSheetsIntegrationProvider } from './providers/google-sheets.provider';
import { GmailIntegrationProvider } from './providers/gmail.provider';
import { HubSpotIntegrationProvider } from './providers/hubspot.provider';
import { DiscordIntegrationProvider } from './providers/discord.provider';

export interface ConnectApiKeyDto {
  provider: string;
  name: string;
  apiKey?: string;
  webhookUrl?: string;
  extra?: Record<string, any>;
}

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);
  private readonly providers = new Map<string, IntegrationProvider>();

  constructor(
    @InjectModel(IntegrationConnection.name)
    private readonly connectionModel: Model<IntegrationConnectionDocument>,
    private readonly encryptionService: EncryptionService,
    private readonly slackProvider: SlackIntegrationProvider,
    private readonly sheetsProvider: GoogleSheetsIntegrationProvider,
    private readonly gmailProvider: GmailIntegrationProvider,
    private readonly hubspotProvider: HubSpotIntegrationProvider,
    private readonly discordProvider: DiscordIntegrationProvider,
  ) {
    this.registerProvider(this.slackProvider);
    this.registerProvider(this.sheetsProvider);
    this.registerProvider(this.gmailProvider);
    this.registerProvider(this.hubspotProvider);
    this.registerProvider(this.discordProvider);
  }

  private registerProvider(provider: IntegrationProvider) {
    this.providers.set(provider.providerName.toLowerCase(), provider);
  }

  public getProvider(name: string): IntegrationProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new NotFoundException(`Integration provider [${name}] is not registered`);
    }
    return provider;
  }

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  getAvailableCatalog() {
    return [
      {
        id: 'slack',
        name: 'Slack',
        description: 'Send messages, alerts, and notifications to Slack channels',
        category: 'Communication',
        authType: 'oauth2_or_webhook',
        supportedActions: ['send_message', 'post_webhook'],
        icon: 'slack',
      },
      {
        id: 'google_sheets',
        name: 'Google Sheets',
        description: 'Append rows, read records, and sync automation spreadsheets',
        category: 'Productivity',
        authType: 'api_key_or_oauth2',
        supportedActions: ['append_row', 'read_rows'],
        icon: 'sheets',
      },
      {
        id: 'gmail',
        name: 'Gmail',
        description: 'Send automated transactional and notification emails',
        category: 'Communication',
        authType: 'api_key_or_oauth2',
        supportedActions: ['send_email'],
        icon: 'gmail',
      },
      {
        id: 'hubspot',
        name: 'HubSpot CRM',
        description: 'Create and sync contacts, leads, and customer profiles',
        category: 'CRM',
        authType: 'api_key',
        supportedActions: ['create_contact', 'get_contact'],
        icon: 'hubspot',
      },
      {
        id: 'discord',
        name: 'Discord',
        description: 'Post webhook messages and rich embeds to Discord channels',
        category: 'Communication',
        authType: 'webhook_url',
        supportedActions: ['send_message', 'post_webhook'],
        icon: 'discord',
      },
    ];
  }

  async listConnections(organizationId: string, workspaceId: string) {
    return this.connectionModel
      .find({
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async connectWithApiKey(
    organizationId: string,
    workspaceId: string,
    userId: string,
    dto: ConnectApiKeyDto,
  ): Promise<IntegrationConnectionDocument> {
    const provider = this.getProvider(dto.provider);

    const creds: DecryptedCredentials = {
      apiKey: dto.apiKey,
      webhookUrl: dto.webhookUrl,
      extra: dto.extra,
    };

    const isValid = await provider.validateConnection(creds);
    if (!isValid) {
      throw new BadRequestException(`Validation failed for provider [${dto.provider}]. Please check your credentials.`);
    }

    const account = await provider.getAccount(creds);

    let encryptedApiKey: any;
    if (dto.apiKey) {
      encryptedApiKey = this.encryptionService.encrypt(dto.apiKey);
    }

    const connection = new this.connectionModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      provider: dto.provider,
      name: dto.name || account.accountName || `${dto.provider} connection`,
      status: 'connected',
      authType: dto.webhookUrl ? 'webhook_url' : 'api_key',
      credentials: {
        encryptedAccessToken: encryptedApiKey?.encryptedData,
        iv: encryptedApiKey?.iv,
        tag: encryptedApiKey?.tag,
        webhookUrl: dto.webhookUrl,
      },
      metadata: {
        accountEmail: account.accountEmail,
        accountName: account.accountName,
        ...account.metadata,
      },
      createdBy: this.toObjectId(userId),
      lastSyncedAt: new Date(),
    });

    await connection.save();
    this.logger.log(`Created integration connection [${connection._id}] for [${dto.provider}] in org [${organizationId}]`);
    return connection;
  }

  getOAuthAuthorizeUrl(providerName: string, state: string): string {
    const provider = this.getProvider(providerName);
    if (!provider.getAuthorizeUrl) {
      throw new BadRequestException(`Provider [${providerName}] does not support OAuth2 flow`);
    }
    return provider.getAuthorizeUrl(state);
  }

  async handleOAuthCallback(
    organizationId: string,
    workspaceId: string,
    userId: string,
    providerName: string,
    code: string,
  ): Promise<IntegrationConnectionDocument> {
    const provider = this.getProvider(providerName);
    if (!provider.authenticate) {
      throw new BadRequestException(`Provider [${providerName}] does not support OAuth authentication`);
    }

    const tokens = await provider.authenticate(code);

    const encAccess = this.encryptionService.encrypt(tokens.accessToken);
    const encRefresh = tokens.refreshToken ? this.encryptionService.encrypt(tokens.refreshToken) : undefined;

    const connection = new this.connectionModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      provider: providerName,
      name: tokens.accountName || `${providerName} OAuth`,
      status: 'connected',
      authType: 'oauth2',
      credentials: {
        encryptedAccessToken: encAccess.encryptedData,
        encryptedRefreshToken: encRefresh?.encryptedData,
        iv: encAccess.iv,
        tag: encAccess.tag,
      },
      metadata: {
        accountEmail: tokens.accountEmail,
        accountName: tokens.accountName,
        scopes: tokens.scopes,
        botId: tokens.botId,
        teamId: tokens.teamId,
      },
      createdBy: this.toObjectId(userId),
      lastSyncedAt: new Date(),
    });

    await connection.save();
    return connection;
  }

  async getDecryptedCredentials(connectionId: string): Promise<{
    connection: IntegrationConnectionDocument;
    credentials: DecryptedCredentials;
  }> {
    const connection = await this.connectionModel
      .findById(this.toObjectId(connectionId))
      .select('+credentials.encryptedAccessToken +credentials.encryptedRefreshToken +credentials.iv +credentials.tag +credentials.apiKey +credentials.webhookUrl')
      .exec();

    if (!connection) {
      throw new NotFoundException('Integration connection not found');
    }

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (connection.credentials?.encryptedAccessToken && connection.credentials.iv && connection.credentials.tag) {
      accessToken = this.encryptionService.decrypt({
        encryptedData: connection.credentials.encryptedAccessToken,
        iv: connection.credentials.iv,
        tag: connection.credentials.tag,
      });
    }

    const credentials: DecryptedCredentials = {
      accessToken,
      refreshToken,
      apiKey: accessToken,
      webhookUrl: connection.credentials?.webhookUrl,
      extra: connection.metadata,
    };

    return { connection, credentials };
  }

  async testConnection(connectionId: string, organizationId: string, workspaceId: string): Promise<boolean> {
    const { connection, credentials } = await this.getDecryptedCredentials(connectionId);
    const provider = this.getProvider(connection.provider);

    try {
      const isValid = await provider.validateConnection(credentials);
      connection.status = isValid ? 'connected' : 'error';
      connection.lastSyncedAt = new Date();
      await connection.save();
      return isValid;
    } catch (err: any) {
      connection.status = 'error';
      connection.errorMessage = err.message;
      await connection.save();
      return false;
    }
  }

  async executeAction(connectionId: string, action: string, params: any): Promise<ActionResult> {
    const { connection, credentials } = await this.getDecryptedCredentials(connectionId);
    const provider = this.getProvider(connection.provider);

    return provider.executeAction(action, params, credentials);
  }

  async disconnect(connectionId: string, organizationId: string, workspaceId: string): Promise<void> {
    const res = await this.connectionModel.deleteOne({
      _id: this.toObjectId(connectionId),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    });

    if (res.deletedCount === 0) {
      throw new NotFoundException('Integration connection not found');
    }
  }
}
