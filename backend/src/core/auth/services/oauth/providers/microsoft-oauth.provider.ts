import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OAuthProfile, OAuthProviderInterface } from '../oauth.interface';
import { AuthConfig } from '../../../../config/auth.config';

@Injectable()
export class MicrosoftOAuthProvider implements OAuthProviderInterface {
  readonly providerName = 'microsoft';
  private readonly logger = new Logger(MicrosoftOAuthProvider.name);
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor(private readonly configService: ConfigService) {
    const authConfig = this.configService.get<AuthConfig>('auth');
    this.clientId = authConfig?.microsoftClientId || process.env.MICROSOFT_CLIENT_ID || '';
    this.clientSecret = authConfig?.microsoftClientSecret || process.env.MICROSOFT_CLIENT_SECRET || '';
    this.callbackUrl = authConfig?.microsoftCallbackUrl || process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/microsoft/callback';
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.callbackUrl,
      response_mode: 'query',
      scope: 'openid email profile User.Read',
      state,
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async authenticate(code: string): Promise<OAuthProfile> {
    try {
      const tokenResponse = await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.callbackUrl,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { access_token } = tokenResponse.data;

      const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const data = profileResponse.data;
      const email = (data.mail || data.userPrincipalName || '').toLowerCase();

      return {
        provider: this.providerName,
        providerUserId: data.id,
        email,
        firstName: data.givenName || data.displayName || 'User',
        lastName: data.surname || '',
        emailVerified: true,
      };
    } catch (error: any) {
      this.logger.error(`Microsoft OAuth token exchange failed: ${error.response?.data?.error_description || error.message}`);
      throw new UnauthorizedException('Failed to authenticate with Microsoft OAuth');
    }
  }
}
