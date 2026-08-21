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
var MicrosoftOAuthProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicrosoftOAuthProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let MicrosoftOAuthProvider = MicrosoftOAuthProvider_1 = class MicrosoftOAuthProvider {
    configService;
    providerName = 'microsoft';
    logger = new common_1.Logger(MicrosoftOAuthProvider_1.name);
    clientId;
    clientSecret;
    callbackUrl;
    constructor(configService) {
        this.configService = configService;
        const authConfig = this.configService.get('auth');
        this.clientId = authConfig?.microsoftClientId || process.env.MICROSOFT_CLIENT_ID || '';
        this.clientSecret = authConfig?.microsoftClientSecret || process.env.MICROSOFT_CLIENT_SECRET || '';
        this.callbackUrl = authConfig?.microsoftCallbackUrl || process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/microsoft/callback';
    }
    getAuthorizationUrl(state) {
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
    async authenticate(code) {
        try {
            const tokenResponse = await axios_1.default.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                redirect_uri: this.callbackUrl,
                grant_type: 'authorization_code',
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const { access_token } = tokenResponse.data;
            const profileResponse = await axios_1.default.get('https://graph.microsoft.com/v1.0/me', {
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
        }
        catch (error) {
            this.logger.error(`Microsoft OAuth token exchange failed: ${error.response?.data?.error_description || error.message}`);
            throw new common_1.UnauthorizedException('Failed to authenticate with Microsoft OAuth');
        }
    }
};
exports.MicrosoftOAuthProvider = MicrosoftOAuthProvider;
exports.MicrosoftOAuthProvider = MicrosoftOAuthProvider = MicrosoftOAuthProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MicrosoftOAuthProvider);
//# sourceMappingURL=microsoft-oauth.provider.js.map