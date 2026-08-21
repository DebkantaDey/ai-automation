import { IntegrationProvider, DecryptedCredentials, AccountInfo, ActionResult, OAuthTokens } from '../integration.interface';
export declare class SlackIntegrationProvider implements IntegrationProvider {
    readonly providerName = "slack";
    private readonly logger;
    getAuthorizeUrl(state: string): string;
    authenticate(code: string): Promise<OAuthTokens>;
    getAccount(credentials: DecryptedCredentials): Promise<AccountInfo>;
    executeAction(action: string, params: any, credentials: DecryptedCredentials): Promise<ActionResult>;
    validateConnection(credentials: DecryptedCredentials): Promise<boolean>;
}
