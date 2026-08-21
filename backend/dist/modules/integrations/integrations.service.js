"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IntegrationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const integration_connection_schema_1 = require("./schemas/integration-connection.schema");
const encryption_service_1 = require("../../core/security/encryption.service");
const slack_provider_1 = require("./providers/slack.provider");
const google_sheets_provider_1 = require("./providers/google-sheets.provider");
const gmail_provider_1 = require("./providers/gmail.provider");
const hubspot_provider_1 = require("./providers/hubspot.provider");
const discord_provider_1 = require("./providers/discord.provider");
let IntegrationsService = IntegrationsService_1 = class IntegrationsService {
    connectionModel;
    encryptionService;
    slackProvider;
    sheetsProvider;
    gmailProvider;
    hubspotProvider;
    discordProvider;
    logger = new common_1.Logger(IntegrationsService_1.name);
    providers = new Map();
    constructor(connectionModel, encryptionService, slackProvider, sheetsProvider, gmailProvider, hubspotProvider, discordProvider) {
        this.connectionModel = connectionModel;
        this.encryptionService = encryptionService;
        this.slackProvider = slackProvider;
        this.sheetsProvider = sheetsProvider;
        this.gmailProvider = gmailProvider;
        this.hubspotProvider = hubspotProvider;
        this.discordProvider = discordProvider;
        this.registerProvider(this.slackProvider);
        this.registerProvider(this.sheetsProvider);
        this.registerProvider(this.gmailProvider);
        this.registerProvider(this.hubspotProvider);
        this.registerProvider(this.discordProvider);
    }
    registerProvider(provider) {
        this.providers.set(provider.providerName.toLowerCase(), provider);
    }
    getProvider(name) {
        const provider = this.providers.get(name.toLowerCase());
        if (!provider) {
            throw new common_1.NotFoundException(`Integration provider [${name}] is not registered`);
        }
        return provider;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
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
    async listConnections(organizationId, workspaceId) {
        return this.connectionModel
            .find({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        })
            .sort({ updatedAt: -1 })
            .exec();
    }
    async connectWithApiKey(organizationId, workspaceId, userId, dto) {
        const provider = this.getProvider(dto.provider);
        const creds = {
            apiKey: dto.apiKey,
            webhookUrl: dto.webhookUrl,
            extra: dto.extra,
        };
        const isValid = await provider.validateConnection(creds);
        if (!isValid) {
            throw new common_1.BadRequestException(`Validation failed for provider [${dto.provider}]. Please check your credentials.`);
        }
        const account = await provider.getAccount(creds);
        let encryptedApiKey;
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
    getOAuthAuthorizeUrl(providerName, state) {
        const provider = this.getProvider(providerName);
        if (!provider.getAuthorizeUrl) {
            throw new common_1.BadRequestException(`Provider [${providerName}] does not support OAuth2 flow`);
        }
        return provider.getAuthorizeUrl(state);
    }
    async handleOAuthCallback(organizationId, workspaceId, userId, providerName, code) {
        const provider = this.getProvider(providerName);
        if (!provider.authenticate) {
            throw new common_1.BadRequestException(`Provider [${providerName}] does not support OAuth authentication`);
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
    async getDecryptedCredentials(connectionId) {
        const connection = await this.connectionModel
            .findById(this.toObjectId(connectionId))
            .select('+credentials.encryptedAccessToken +credentials.encryptedRefreshToken +credentials.iv +credentials.tag +credentials.apiKey +credentials.webhookUrl')
            .exec();
        if (!connection) {
            throw new common_1.NotFoundException('Integration connection not found');
        }
        let accessToken;
        let refreshToken;
        if (connection.credentials?.encryptedAccessToken && connection.credentials.iv && connection.credentials.tag) {
            accessToken = this.encryptionService.decrypt({
                encryptedData: connection.credentials.encryptedAccessToken,
                iv: connection.credentials.iv,
                tag: connection.credentials.tag,
            });
        }
        const credentials = {
            accessToken,
            refreshToken,
            apiKey: accessToken,
            webhookUrl: connection.credentials?.webhookUrl,
            extra: connection.metadata,
        };
        return { connection, credentials };
    }
    async testConnection(connectionId, organizationId, workspaceId) {
        const { connection, credentials } = await this.getDecryptedCredentials(connectionId);
        const provider = this.getProvider(connection.provider);
        try {
            const isValid = await provider.validateConnection(credentials);
            connection.status = isValid ? 'connected' : 'error';
            connection.lastSyncedAt = new Date();
            await connection.save();
            return isValid;
        }
        catch (err) {
            connection.status = 'error';
            connection.errorMessage = err.message;
            await connection.save();
            return false;
        }
    }
    async executeAction(connectionId, action, params) {
        const { connection, credentials } = await this.getDecryptedCredentials(connectionId);
        const provider = this.getProvider(connection.provider);
        return provider.executeAction(action, params, credentials);
    }
    async disconnect(connectionId, organizationId, workspaceId) {
        const res = await this.connectionModel.deleteOne({
            _id: this.toObjectId(connectionId),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        });
        if (res.deletedCount === 0) {
            throw new common_1.NotFoundException('Integration connection not found');
        }
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = IntegrationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(integration_connection_schema_1.IntegrationConnection.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        encryption_service_1.EncryptionService,
        slack_provider_1.SlackIntegrationProvider,
        google_sheets_provider_1.GoogleSheetsIntegrationProvider,
        gmail_provider_1.GmailIntegrationProvider,
        hubspot_provider_1.HubSpotIntegrationProvider,
        discord_provider_1.DiscordIntegrationProvider])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map