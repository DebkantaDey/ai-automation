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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const oauth_service_1 = require("./services/oauth/oauth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const password_dto_1 = require("./dto/password.dto");
const tenant_decorators_1 = require("../tenancy/tenant.decorators");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const config_1 = require("@nestjs/config");
let AuthController = class AuthController {
    authService;
    oauthService;
    configService;
    constructor(authService, oauthService, configService) {
        this.authService = authService;
        this.oauthService = oauthService;
        this.configService = configService;
    }
    setAuthCookies(res, accessToken, refreshToken) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000,
        });
        if (refreshToken) {
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
    }
    clearAuthCookies(res) {
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async verifyEmail(dto, req, res, ipAddress) {
        const userAgent = req.headers['user-agent'] || '';
        const result = await this.authService.verifyEmail(dto, ipAddress, userAgent);
        if (result.tokens) {
            this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
        }
        return result;
    }
    async resendVerification(dto) {
        return this.authService.resendVerification(dto);
    }
    async login(dto, req, res, ipAddress) {
        const userAgent = req.headers['user-agent'] || '';
        const result = await this.authService.login(dto, ipAddress, userAgent);
        if (result.tokens) {
            this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
        }
        return result;
    }
    async refreshToken(dto, req, res, ipAddress) {
        const refreshToken = dto.refreshToken || req.cookies?.refresh_token;
        const userAgent = req.headers['user-agent'] || '';
        const tokens = await this.authService.refreshToken(refreshToken, ipAddress, userAgent);
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        return tokens;
    }
    async logout(dto, req, res) {
        const refreshToken = dto.refreshToken || req.cookies?.refresh_token;
        const result = await this.authService.logout(refreshToken);
        this.clearAuthCookies(res);
        return result;
    }
    async logoutAll(userId, res) {
        const result = await this.authService.logoutAll(userId);
        this.clearAuthCookies(res);
        return result;
    }
    async forgotPassword(dto) {
        return this.authService.forgotPassword(dto);
    }
    async resetPassword(dto, res) {
        const result = await this.authService.resetPassword(dto);
        this.clearAuthCookies(res);
        return result;
    }
    async changePassword(userId, dto, res) {
        const result = await this.authService.changePassword(userId, dto);
        this.clearAuthCookies(res);
        return result;
    }
    async getMe(userId, activeOrgId) {
        return this.authService.getMe(userId, activeOrgId);
    }
    async googleAuth(res) {
        const state = Math.random().toString(36).substring(7);
        const url = this.oauthService.getAuthorizationUrl('google', state);
        res.redirect(url);
    }
    async googleCallback(code, req, res, ipAddress) {
        const userAgent = req.headers['user-agent'] || '';
        const user = await this.oauthService.handleOAuthCallback('google', code, ipAddress, userAgent);
        const tokens = await this.authService.createSession(user, ipAddress, userAgent);
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        const frontendUrl = this.configService.get('app.frontendUrl') || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/login?oauth_success=true`);
    }
    async microsoftAuth(res) {
        const state = Math.random().toString(36).substring(7);
        const url = this.oauthService.getAuthorizationUrl('microsoft', state);
        res.redirect(url);
    }
    async microsoftCallback(code, req, res, ipAddress) {
        const userAgent = req.headers['user-agent'] || '';
        const user = await this.oauthService.handleOAuthCallback('microsoft', code, ipAddress, userAgent);
        const tokens = await this.authService.createSession(user, ipAddress, userAgent);
        this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        const frontendUrl = this.configService.get('app.frontendUrl') || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/login?oauth_success=true`);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new tenant account and root user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User & organization created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email address with single-use token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('resend-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Resend email verification link' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.ResendVerificationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate user with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authentication successful' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate refresh token and issue new access token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.RefreshTokenDto, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout and revoke current refresh token session' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.RefreshTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('logout-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke all sessions across all devices for current user' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset email' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password using single-use reset token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_dto_1.ResetPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change password for authenticated user' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, password_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile, memberships, and workspaces' }),
    __param(0, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(1, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Get)('google'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Google OAuth login redirect' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Get)('google/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Google OAuth callback' }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Get)('microsoft'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Microsoft OAuth login redirect' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "microsoftAuth", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Get)('microsoft/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Microsoft OAuth callback' }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "microsoftCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        oauth_service_1.OAuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map