export interface DecryptedCredentials {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    webhookUrl?: string;
    clientId?: string;
    clientSecret?: string;
    extra?: Record<string, any>;
}
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scopes?: string[];
    accountEmail?: string;
    accountName?: string;
    teamId?: string;
    botId?: string;
}
export interface AccountInfo {
    accountId?: string;
    accountEmail?: string;
    accountName?: string;
    metadata?: Record<string, any>;
}
export interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
}
export interface IntegrationProvider {
    readonly providerName: string;
    getAuthorizeUrl?(state: string): string;
    authenticate?(code: string): Promise<OAuthTokens>;
    refreshToken?(refreshToken: string): Promise<OAuthTokens>;
    getAccount(credentials: DecryptedCredentials): Promise<AccountInfo>;
    executeAction(action: string, params: any, credentials: DecryptedCredentials): Promise<ActionResult>;
    validateConnection(credentials: DecryptedCredentials): Promise<boolean>;
}
