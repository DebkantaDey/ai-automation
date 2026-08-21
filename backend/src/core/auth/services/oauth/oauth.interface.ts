export interface OAuthProfile {
  provider: 'google' | 'microsoft' | string;
  providerUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  emailVerified: boolean;
}

export interface OAuthProviderInterface {
  readonly providerName: string;
  getAuthorizationUrl(state: string): string;
  authenticate(code: string): Promise<OAuthProfile>;
}
