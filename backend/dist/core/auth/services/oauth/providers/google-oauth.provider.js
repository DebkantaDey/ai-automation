"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleOAuthProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let GoogleOAuthProvider = GoogleOAuthProvider_1 = class GoogleOAuthProvider {
    configService;
    providerName = 'google';
    logger = new common_1.Logger(GoogleOAuthProvider_1.name);
    clientId;
    clientSecret;
    callbackUrl;
    constructor(configService) {
        this.configService = configService;
        const authConfig = this.configService.get('auth');
        this.clientId = authConfig?.googleClientId || process.env.GOOGLE_CLIENT_ID || '';
        this.clientSecret = authConfig?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
        this.callbackUrl = authConfig?.googleCallbackUrl || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/google/callback';
    }
    getAuthorizationUrl(state) {
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
    async authenticate(code) {
        try {
            const tokenResponse = await axios_1.default.post('https://oauth2.googleapis.com/token', new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.callbackUrl,
                grant_type: 'authorization_code',
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const { access_token } = tokenResponse.data;
            const userinfoResponse = await axios_1.default.get('https://www.googleapis.com/oauth2/v3/userinfo', {
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
        }
        catch (error) {
            this.logger.error(`Google OAuth token exchange failed: ${error.response?.data?.error_description || error.message}`);
            throw new common_1.UnauthorizedException('Failed to authenticate with Google OAuth');
        }
    }
};
exports.GoogleOAuthProvider = GoogleOAuthProvider;
exports.GoogleOAuthProvider = GoogleOAuthProvider = GoogleOAuthProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleOAuthProvider);
//# sourceMappingURL=google-oauth.provider.js.map