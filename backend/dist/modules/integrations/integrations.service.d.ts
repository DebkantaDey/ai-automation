import { Model, Types } from 'mongoose';
import { IntegrationConnection, IntegrationConnectionDocument } from './schemas/integration-connection.schema';
import { IntegrationProvider, DecryptedCredentials, ActionResult } from './integration.interface';
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
export declare class IntegrationsService {
    private readonly connectionModel;
    private readonly encryptionService;
    private readonly slackProvider;
    private readonly sheetsProvider;
    private readonly gmailProvider;
    private readonly hubspotProvider;
    private readonly discordProvider;
    private readonly logger;
    private readonly providers;
    constructor(connectionModel: Model<IntegrationConnectionDocument>, encryptionService: EncryptionService, slackProvider: SlackIntegrationProvider, sheetsProvider: GoogleSheetsIntegrationProvider, gmailProvider: GmailIntegrationProvider, hubspotProvider: HubSpotIntegrationProvider, discordProvider: DiscordIntegrationProvider);
    private registerProvider;
    getProvider(name: string): IntegrationProvider;
    private toObjectId;
    getAvailableCatalog(): {
        id: string;
        name: string;
        description: string;
        category: string;
        authType: string;
        supportedActions: string[];
        icon: string;
    }[];
    listConnections(organizationId: string, workspaceId: string): Promise<(import("mongoose").Document<unknown, {}, IntegrationConnectionDocument, {}, {}> & IntegrationConnection & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    connectWithApiKey(organizationId: string, workspaceId: string, userId: string, dto: ConnectApiKeyDto): Promise<IntegrationConnectionDocument>;
    getOAuthAuthorizeUrl(providerName: string, state: string): string;
    handleOAuthCallback(organizationId: string, workspaceId: string, userId: string, providerName: string, code: string): Promise<IntegrationConnectionDocument>;
    getDecryptedCredentials(connectionId: string): Promise<{
        connection: IntegrationConnectionDocument;
        credentials: DecryptedCredentials;
    }>;
    testConnection(connectionId: string, organizationId: string, workspaceId: string): Promise<boolean>;
    executeAction(connectionId: string, action: string, params: any): Promise<ActionResult>;
    disconnect(connectionId: string, organizationId: string, workspaceId: string): Promise<void>;
}
