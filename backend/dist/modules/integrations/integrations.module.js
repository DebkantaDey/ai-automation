"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const integrations_controller_1 = require("./integrations.controller");
const integrations_service_1 = require("./integrations.service");
const integration_connection_schema_1 = require("./schemas/integration-connection.schema");
const encryption_service_1 = require("../../core/security/encryption.service");
const slack_provider_1 = require("./providers/slack.provider");
const google_sheets_provider_1 = require("./providers/google-sheets.provider");
const gmail_provider_1 = require("./providers/gmail.provider");
const hubspot_provider_1 = require("./providers/hubspot.provider");
const discord_provider_1 = require("./providers/discord.provider");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: integration_connection_schema_1.IntegrationConnection.name, schema: integration_connection_schema_1.IntegrationConnectionSchema },
            ]),
        ],
        controllers: [integrations_controller_1.IntegrationsController],
        providers: [
            encryption_service_1.EncryptionService,
            integrations_service_1.IntegrationsService,
            slack_provider_1.SlackIntegrationProvider,
            google_sheets_provider_1.GoogleSheetsIntegrationProvider,
            gmail_provider_1.GmailIntegrationProvider,
            hubspot_provider_1.HubSpotIntegrationProvider,
            discord_provider_1.DiscordIntegrationProvider,
        ],
        exports: [integrations_service_1.IntegrationsService, encryption_service_1.EncryptionService, mongoose_1.MongooseModule],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map