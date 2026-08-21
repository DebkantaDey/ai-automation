import { IntegrationProvider, DecryptedCredentials, AccountInfo, ActionResult } from '../integration.interface';
export declare class HubSpotIntegrationProvider implements IntegrationProvider {
    readonly providerName = "hubspot";
    private readonly logger;
    getAccount(credentials: DecryptedCredentials): Promise<AccountInfo>;
    executeAction(action: string, params: any, credentials: DecryptedCredentials): Promise<ActionResult>;
    validateConnection(credentials: DecryptedCredentials): Promise<boolean>;
}
