import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import {
  IntegrationConnection,
  IntegrationConnectionSchema,
} from './schemas/integration-connection.schema';
import { EncryptionService } from '../../core/security/encryption.service';
import { SlackIntegrationProvider } from './providers/slack.provider';
import { GoogleSheetsIntegrationProvider } from './providers/google-sheets.provider';
import { GmailIntegrationProvider } from './providers/gmail.provider';
import { HubSpotIntegrationProvider } from './providers/hubspot.provider';
import { DiscordIntegrationProvider } from './providers/discord.provider';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IntegrationConnection.name, schema: IntegrationConnectionSchema },
    ]),
  ],
  controllers: [IntegrationsController],
  providers: [
    EncryptionService,
    IntegrationsService,
    SlackIntegrationProvider,
    GoogleSheetsIntegrationProvider,
    GmailIntegrationProvider,
    HubSpotIntegrationProvider,
    DiscordIntegrationProvider,
  ],
  exports: [IntegrationsService, EncryptionService, MongooseModule],
})
export class IntegrationsModule {}
