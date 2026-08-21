"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
const user_schema_1 = require("../../modules/users/schemas/user.schema");
const organization_schema_1 = require("../../modules/organizations/schemas/organization.schema");
const organization_member_schema_1 = require("../../modules/organizations/schemas/organization-member.schema");
const workspace_schema_1 = require("../../modules/workspaces/schemas/workspace.schema");
const refresh_token_schema_1 = require("./schemas/refresh-token.schema");
const auth_token_schema_1 = require("./schemas/auth-token.schema");
const email_service_1 = require("./services/email/email.service");
const console_email_provider_1 = require("./services/email/providers/console-email.provider");
const smtp_email_provider_1 = require("./services/email/providers/smtp-email.provider");
const oauth_service_1 = require("./services/oauth/oauth.service");
const google_oauth_provider_1 = require("./services/oauth/providers/google-oauth.provider");
const microsoft_oauth_provider_1 = require("./services/oauth/providers/microsoft-oauth.provider");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const authConfig = configService.get('auth');
                    return {
                        secret: authConfig?.jwtSecret || 'super-secret-jwt-access-key',
                        signOptions: {
                            expiresIn: authConfig?.jwtExpiresIn || '15m',
                        },
                    };
                },
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: organization_schema_1.Organization.name, schema: organization_schema_1.OrganizationSchema },
                { name: organization_member_schema_1.OrganizationMember.name, schema: organization_member_schema_1.OrganizationMemberSchema },
                { name: workspace_schema_1.Workspace.name, schema: workspace_schema_1.WorkspaceSchema },
                { name: refresh_token_schema_1.RefreshToken.name, schema: refresh_token_schema_1.RefreshTokenSchema },
                { name: auth_token_schema_1.AuthToken.name, schema: auth_token_schema_1.AuthTokenSchema },
            ]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            email_service_1.EmailService,
            console_email_provider_1.ConsoleEmailProvider,
            smtp_email_provider_1.SmtpEmailProvider,
            oauth_service_1.OAuthService,
            google_oauth_provider_1.GoogleOAuthProvider,
            microsoft_oauth_provider_1.MicrosoftOAuthProvider,
        ],
        exports: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            email_service_1.EmailService,
            oauth_service_1.OAuthService,
            jwt_1.JwtModule,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map