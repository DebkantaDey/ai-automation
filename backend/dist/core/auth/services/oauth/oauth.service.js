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
var OAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const google_oauth_provider_1 = require("./providers/google-oauth.provider");
const microsoft_oauth_provider_1 = require("./providers/microsoft-oauth.provider");
const user_schema_1 = require("../../../../modules/users/schemas/user.schema");
const organization_schema_1 = require("../../../../modules/organizations/schemas/organization.schema");
const organization_member_schema_1 = require("../../../../modules/organizations/schemas/organization-member.schema");
const workspace_schema_1 = require("../../../../modules/workspaces/schemas/workspace.schema");
const role_enum_1 = require("../../../common/enums/role.enum");
let OAuthService = OAuthService_1 = class OAuthService {
    userModel;
    orgModel;
    memberModel;
    workspaceModel;
    googleProvider;
    microsoftProvider;
    logger = new common_1.Logger(OAuthService_1.name);
    providers = new Map();
    constructor(userModel, orgModel, memberModel, workspaceModel, googleProvider, microsoftProvider) {
        this.userModel = userModel;
        this.orgModel = orgModel;
        this.memberModel = memberModel;
        this.workspaceModel = workspaceModel;
        this.googleProvider = googleProvider;
        this.microsoftProvider = microsoftProvider;
        this.providers.set('google', this.googleProvider);
        this.providers.set('microsoft', this.microsoftProvider);
    }
    getProvider(name) {
        const provider = this.providers.get(name.toLowerCase());
        if (!provider) {
            throw new common_1.NotFoundException(`OAuth provider '${name}' is not supported`);
        }
        return provider;
    }
    getAuthorizationUrl(providerName, state) {
        const provider = this.getProvider(providerName);
        return provider.getAuthorizationUrl(state);
    }
    async handleOAuthCallback(providerName, code, ipAddress, userAgent) {
        const provider = this.getProvider(providerName);
        const profile = await provider.authenticate(code);
        if (!profile.email) {
            throw new common_1.UnauthorizedException('OAuth provider did not return an email address');
        }
        let user = await this.userModel.findOne({
            'authProviders.provider': profile.provider,
            'authProviders.providerUserId': profile.providerUserId,
        });
        if (user) {
            if (user.status === 'suspended' || user.status === 'deleted') {
                throw new common_1.ForbiddenException(`Account is ${user.status}. Please contact support.`);
            }
            user.lastLoginAt = new Date();
            user.lastLoginIp = ipAddress;
            user.lastLoginUserAgent = userAgent;
            await user.save();
            return user;
        }
        user = await this.userModel.findOne({ email: profile.email.toLowerCase() });
        if (user) {
            if (user.status === 'suspended' || user.status === 'deleted') {
                throw new common_1.ForbiddenException(`Account is ${user.status}. Please contact support.`);
            }
            user.authProviders.push({
                provider: profile.provider,
                providerUserId: profile.providerUserId,
                email: profile.email,
                connectedAt: new Date(),
            });
            user.emailVerified = true;
            if (user.status === 'pending') {
                user.status = 'active';
            }
            if (!user.profileImage && profile.profileImage) {
                user.profileImage = profile.profileImage;
            }
            user.lastLoginAt = new Date();
            user.lastLoginIp = ipAddress;
            user.lastLoginUserAgent = userAgent;
            await user.save();
            return user;
        }
        const newUser = new this.userModel({
            firstName: profile.firstName || 'User',
            lastName: profile.lastName || '',
            email: profile.email.toLowerCase(),
            profileImage: profile.profileImage,
            emailVerified: true,
            status: 'active',
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress,
            lastLoginUserAgent: userAgent,
            authProviders: [
                {
                    provider: profile.provider,
                    providerUserId: profile.providerUserId,
                    email: profile.email,
                    connectedAt: new Date(),
                },
            ],
        });
        await newUser.save();
        const orgName = `${profile.firstName}'s Org`;
        const slug = `${profile.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
        const organization = new this.orgModel({
            name: orgName,
            slug,
            ownerId: newUser._id,
            plan: 'free',
            subscriptionStatus: 'active',
        });
        await organization.save();
        const workspace = new this.workspaceModel({
            organizationId: organization._id,
            name: 'Default Workspace',
            slug: 'default',
            isDefault: true,
            description: 'Default production automation workspace',
        });
        await workspace.save();
        const member = new this.memberModel({
            organizationId: organization._id,
            userId: newUser._id,
            role: role_enum_1.OrganizationRole.OWNER,
            status: 'active',
        });
        await member.save();
        newUser.defaultOrganizationId = organization._id;
        newUser.defaultWorkspaceId = workspace._id;
        await newUser.save();
        return newUser;
    }
};
exports.OAuthService = OAuthService;
exports.OAuthService = OAuthService = OAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(organization_schema_1.Organization.name)),
    __param(2, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __param(3, (0, mongoose_1.InjectModel)(workspace_schema_1.Workspace.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        google_oauth_provider_1.GoogleOAuthProvider,
        microsoft_oauth_provider_1.MicrosoftOAuthProvider])
], OAuthService);
//# sourceMappingURL=oauth.service.js.map