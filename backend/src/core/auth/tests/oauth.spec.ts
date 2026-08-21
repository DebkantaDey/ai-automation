import { OAuthService } from '../services/oauth/oauth.service';
import { GoogleOAuthProvider } from '../services/oauth/providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from '../services/oauth/providers/microsoft-oauth.provider';

describe('OAuthService - Multi-Provider Strategy', () => {
  let oauthService: OAuthService;
  let mockGoogleProvider: Partial<GoogleOAuthProvider>;
  let mockMicrosoftProvider: Partial<MicrosoftOAuthProvider>;
  let mockUserModel: any;
  let mockOrgModel: any;
  let mockMemberModel: any;
  let mockWorkspaceModel: any;

  beforeEach(() => {
    mockGoogleProvider = {
      providerName: 'google',
      getAuthorizationUrl: jest.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?state=123'),
      authenticate: jest.fn().mockResolvedValue({
        provider: 'google',
        providerUserId: 'google-sub-123',
        email: 'alex@company.com',
        firstName: 'Alex',
        lastName: 'Morgan',
        profileImage: 'https://lh3.googleusercontent.com/photo',
        emailVerified: true,
      }),
    };

    mockMicrosoftProvider = {
      providerName: 'microsoft',
      getAuthorizationUrl: jest.fn().mockReturnValue('https://login.microsoftonline.com/oauth2/authorize?state=123'),
      authenticate: jest.fn().mockResolvedValue({
        provider: 'microsoft',
        providerUserId: 'ms-sub-456',
        email: 'alex@company.com',
        firstName: 'Alex',
        lastName: 'Morgan',
        emailVerified: true,
      }),
    };

    mockUserModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'user-oauth-1',
      save: jest.fn().mockResolvedValue(true),
    }));
    mockUserModel.findOne = jest.fn();

    mockOrgModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'org-oauth-1',
      save: jest.fn().mockResolvedValue(true),
    }));

    mockMemberModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));

    mockWorkspaceModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'ws-oauth-1',
      save: jest.fn().mockResolvedValue(true),
    }));

    oauthService = new OAuthService(
      mockUserModel,
      mockOrgModel,
      mockMemberModel,
      mockWorkspaceModel,
      mockGoogleProvider as GoogleOAuthProvider,
      mockMicrosoftProvider as MicrosoftOAuthProvider,
    );
  });

  it('should generate correct authorization URL for Google', () => {
    const url = oauthService.getAuthorizationUrl('google', 'state-xyz');
    expect(url).toContain('https://accounts.google.com');
  });

  it('should authenticate with Google and link existing user account', async () => {
    const existingUser = {
      _id: 'user-1',
      email: 'alex@company.com',
      authProviders: [],
      save: jest.fn().mockResolvedValue(true),
    };
    mockUserModel.findOne
      .mockResolvedValueOnce(null) // Provider not yet linked
      .mockResolvedValueOnce(existingUser); // Found user by email

    const user = await oauthService.handleOAuthCallback('google', 'google-auth-code');

    expect(user._id).toBe('user-1');
    expect(existingUser.authProviders.length).toBe(1);
    expect(existingUser.authProviders[0].provider).toBe('google');
  });
});
