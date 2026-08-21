import { ConfigService } from '@nestjs/config';
import { OAuthProfile, OAuthProviderInterface } from '../oauth.interface';
export declare class GoogleOAuthProvider implements OAuthProviderInterface {
    private readonly configService;
    readonly providerName = "google";
    private readonly logger;
    private clientId;
    private clientSecret;
    private callbackUrl;
    constructor(configService: ConfigService);
    getAuthorizationUrl(state: string): string;
    authenticate(code: string): Promise<OAuthProfile>;
}
