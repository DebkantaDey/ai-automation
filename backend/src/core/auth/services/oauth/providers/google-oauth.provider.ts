import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OAuthProfile, OAuthProviderInterface } from '../oauth.interface';
import { AuthConfig } from '../../../../config/auth.config';

@Injectable()
export class GoogleOAuthProvider implements OAuthProviderInterface {
  readonly providerName = 'google';
  private readonly logger = new Logger(GoogleOAuthProvider.name);
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor(private readonly configService: ConfigService) {
    const authConfig = this.configService.get<AuthConfig>('auth');
    this.clientId = authConfig?.googleClientId || process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = authConfig?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
    this.callbackUrl = authConfig?.googleCallbackUrl || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/google/callback';
  }

  getAuthorizationUrl(state: string): string {
    if (!this.clientId) {
      this.logger.warn('Google Client ID not configured');
    }
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      state,
      prompt: 'select_account',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async authenticate(code: string): Promise<OAuthProfile> {
    try {
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.callbackUrl,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { access_token } = tokenResponse.data;

      const userinfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const data = userinfoResponse.data;

      return {
        provider: this.providerName,
        providerUserId: data.sub,
        email: data.email.toLowerCase(),
        firstName: data.given_name || data.name || 'User',
        lastName: data.family_name || '',
        profileImage: data.picture,
        emailVerified: data.email_verified === true,
      };
    } catch (error: any) {
      this.logger.error(`Google OAuth token exchange failed: ${error.response?.data?.error_description || error.message}`);
      throw new UnauthorizedException('Failed to authenticate with Google OAuth');
    }
  }
}
