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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const argon2 = require("argon2");
const crypto = require("crypto");
const uuid_1 = require("uuid");
const user_schema_1 = require("../../modules/users/schemas/user.schema");
const organization_schema_1 = require("../../modules/organizations/schemas/organization.schema");
const organization_member_schema_1 = require("../../modules/organizations/schemas/organization-member.schema");
const workspace_schema_1 = require("../../modules/workspaces/schemas/workspace.schema");
const refresh_token_schema_1 = require("./schemas/refresh-token.schema");
const auth_token_schema_1 = require("./schemas/auth-token.schema");
const email_service_1 = require("./services/email/email.service");
const role_enum_1 = require("../common/enums/role.enum");
let AuthService = AuthService_1 = class AuthService {
    userModel;
    orgModel;
    memberModel;
    workspaceModel;
    refreshTokenModel;
    authTokenModel;
    jwtService;
    configService;
    emailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userModel, orgModel, memberModel, workspaceModel, refreshTokenModel, authTokenModel, jwtService, configService, emailService) {
        this.userModel = userModel;
        this.orgModel = orgModel;
        this.memberModel = memberModel;
        this.workspaceModel = workspaceModel;
        this.refreshTokenModel = refreshTokenModel;
        this.authTokenModel = authTokenModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
    hashToken(rawToken) {
        return crypto.createHash('sha256').update(rawToken).digest('hex');
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async register(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (existing) {
            throw new common_1.ConflictException('A user with this email address already exists');
        }
        const passwordHash = await argon2.hash(dto.password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
        });
        const user = new this.userModel({
            firstName: dto.firstName,
            lastName: dto.lastName || '',
            email: dto.email.toLowerCase(),
            passwordHash,
            emailVerified: false,
            status: 'pending',
            authProviders: [{ provider: 'local', providerUserId: dto.email.toLowerCase(), connectedAt: new Date() }],
        });
        await user.save();
        const orgName = dto.organizationName || `${dto.firstName}'s Org`;
        let baseSlug = this.slugify(orgName);
        let slug = baseSlug;
        let counter = 1;
        while (await this.orgModel.findOne({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }
        const organization = new this.orgModel({
            name: orgName,
            slug,
            ownerId: user._id,
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
            userId: user._id,
            role: role_enum_1.OrganizationRole.OWNER,
            status: 'active',
        });
        await member.save();
        user.defaultOrganizationId = organization._id;
        user.defaultWorkspaceId = workspace._id;
        await user.save();
        const rawVerificationToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(rawVerificationToken);
        const authToken = new this.authTokenModel({
            userId: user._id,
            tokenHash,
            type: 'email_verification',
            expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        });
        await authToken.save();
        await this.emailService.sendVerificationEmail(user.email, user.firstName, rawVerificationToken);
        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified,
                status: user.status,
            },
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                plan: organization.plan,
                role: role_enum_1.OrganizationRole.OWNER,
            },
            workspace: {
                id: workspace._id,
                name: workspace.name,
                slug: workspace.slug,
            },
            message: 'Registration successful. A verification link has been sent to your email address.',
        };
    }
    async verifyEmail(dto, ipAddress, userAgent) {
        const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        if (user.emailVerified) {
            return { message: 'Email is already verified. You can log in.' };
        }
        const tokenHash = this.hashToken(dto.token);
        const authToken = await this.authTokenModel.findOne({
            userId: user._id,
            tokenHash,
            type: 'email_verification',
            isUsed: false,
            expiresAt: { $gt: new Date() },
        });
        if (!authToken) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        authToken.isUsed = true;
        authToken.usedAt = new Date();
        await authToken.save();
        user.emailVerified = true;
        if (user.status === 'pending') {
            user.status = 'active';
        }
        await user.save();
        const tokens = await this.createSession(user, ipAddress, userAgent);
        return {
            message: 'Email successfully verified',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: true,
                status: user.status,
            },
            tokens,
        };
    }
    async resendVerification(dto) {
        const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (user && !user.emailVerified && user.status !== 'deleted') {
            await this.authTokenModel.updateMany({ userId: user._id, type: 'email_verification', isUsed: false }, { $set: { isUsed: true } });
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = this.hashToken(rawToken);
            const authToken = new this.authTokenModel({
                userId: user._id,
                tokenHash,
                type: 'email_verification',
                expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
            });
            await authToken.save();
            await this.emailService.sendVerificationEmail(user.email, user.firstName, rawToken);
        }
        return {
            message: 'If an account exists with this email and is unverified, a new verification link has been sent.',
        };
    }
    async login(dto, ipAddress, userAgent) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase() })
            .select('+passwordHash')
            .exec();
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await argon2.verify(user.passwordHash, dto.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status === 'suspended') {
            throw new common_1.ForbiddenException('Your account has been suspended. Please contact support.');
        }
        if (user.status === 'deleted') {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        let orgId = user.defaultOrganizationId ? user.defaultOrganizationId.toString() : undefined;
        let role = role_enum_1.OrganizationRole.MEMBER;
        if (orgId) {
            const member = await this.memberModel.findOne({
                organizationId: this.toObjectId(orgId),
                userId: user._id,
                status: 'active',
            });
            if (member) {
                role = member.role;
            }
            else {
                const anyMember = await this.memberModel.findOne({ userId: user._id, status: 'active' });
                if (anyMember) {
                    orgId = anyMember.organizationId.toString();
                    role = anyMember.role;
                }
            }
        }
        else {
            const anyMember = await this.memberModel.findOne({ userId: user._id, status: 'active' });
            if (anyMember) {
                orgId = anyMember.organizationId.toString();
                role = anyMember.role;
            }
        }
        let workspaceId = user.defaultWorkspaceId ? user.defaultWorkspaceId.toString() : undefined;
        if (orgId && !workspaceId) {
            const defaultWs = await this.workspaceModel.findOne({
                organizationId: this.toObjectId(orgId),
                isDefault: true,
            });
            if (defaultWs) {
                workspaceId = defaultWs._id.toString();
            }
        }
        user.lastLoginAt = new Date();
        user.lastLoginIp = ipAddress;
        user.lastLoginUserAgent = userAgent;
        await user.save();
        const tokens = await this.createSession(user, ipAddress, userAgent, orgId, workspaceId, role, dto.rememberMe);
        const organization = orgId ? await this.orgModel.findById(this.toObjectId(orgId)) : null;
        const workspace = workspaceId ? await this.workspaceModel.findById(this.toObjectId(workspaceId)) : null;
        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName || ''}`.trim(),
                profileImage: user.profileImage,
                emailVerified: user.emailVerified,
                status: user.status,
                systemRole: user.systemRole,
            },
            organization: organization
                ? {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                    plan: organization.plan,
                    role,
                }
                : null,
            workspace: workspace
                ? {
                    id: workspace._id,
                    name: workspace.name,
                    slug: workspace.slug,
                }
                : null,
            tokens,
        };
    }
    async refreshToken(rawRefreshToken, ipAddress, userAgent) {
        if (!rawRefreshToken) {
            throw new common_1.UnauthorizedException('Refresh token is required');
        }
        const tokenHash = this.hashToken(rawRefreshToken);
        const existingToken = await this.refreshTokenModel.findOne({ tokenHash });
        if (!existingToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (existingToken.isRevoked) {
            this.logger.warn(`Security Alert: Replay attack detected for token family [${existingToken.family}]. Revoking entire family.`);
            await this.refreshTokenModel.updateMany({ family: existingToken.family }, { $set: { isRevoked: true } });
            throw new common_1.UnauthorizedException('Security alert: Revoked token reused. Session chain terminated.');
        }
        if (existingToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token has expired. Please log in again.');
        }
        const user = await this.userModel.findById(existingToken.userId);
        if (!user || user.status === 'suspended' || user.status === 'deleted') {
            throw new common_1.UnauthorizedException('User account inactive or not found');
        }
        existingToken.isRevoked = true;
        const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
        const newTokenHash = this.hashToken(newRawRefreshToken);
        existingToken.replacedByTokenHash = newTokenHash;
        await existingToken.save();
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
        const newRefreshTokenDoc = new this.refreshTokenModel({
            userId: user._id,
            tokenHash: newTokenHash,
            family: existingToken.family,
            expiresAt: newExpiresAt,
            ipAddress,
            userAgent,
        });
        await newRefreshTokenDoc.save();
        const authConfig = this.configService.get('auth');
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            systemRole: user.systemRole,
            organizationId: user.defaultOrganizationId?.toString(),
            workspaceId: user.defaultWorkspaceId?.toString(),
            role: role_enum_1.OrganizationRole.MEMBER,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: authConfig?.jwtSecret,
            expiresIn: authConfig?.jwtExpiresIn || '15m',
        });
        return {
            accessToken,
            refreshToken: newRawRefreshToken,
            tokenType: 'Bearer',
            expiresIn: authConfig?.jwtExpiresIn || '15m',
        };
    }
    async logout(rawRefreshToken) {
        if (rawRefreshToken) {
            const tokenHash = this.hashToken(rawRefreshToken);
            await this.refreshTokenModel.updateOne({ tokenHash }, { $set: { isRevoked: true } });
        }
        return { success: true, message: 'Logged out successfully' };
    }
    async logoutAll(userId) {
        await this.refreshTokenModel.updateMany({ userId: this.toObjectId(userId) }, { $set: { isRevoked: true } });
        return { success: true, message: 'Successfully logged out from all devices' };
    }
    async forgotPassword(dto) {
        const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (user && user.status !== 'deleted' && user.status !== 'suspended') {
            await this.authTokenModel.updateMany({ userId: user._id, type: 'password_reset', isUsed: false }, { $set: { isUsed: true } });
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = this.hashToken(rawToken);
            const authToken = new this.authTokenModel({
                userId: user._id,
                tokenHash,
                type: 'password_reset',
                expiresAt: new Date(Date.now() + 3600 * 1000),
            });
            await authToken.save();
            await this.emailService.sendPasswordResetEmail(user.email, user.firstName, rawToken);
        }
        return {
            message: 'If an account exists with this email, a password reset link has been sent.',
        };
    }
    async resetPassword(dto) {
        if (dto.newPassword !== dto.confirmNewPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired password reset token');
        }
        const tokenHash = this.hashToken(dto.token);
        const authToken = await this.authTokenModel.findOne({
            userId: user._id,
            tokenHash,
            type: 'password_reset',
            isUsed: false,
            expiresAt: { $gt: new Date() },
        });
        if (!authToken) {
            throw new common_1.BadRequestException('Invalid or expired password reset token');
        }
        authToken.isUsed = true;
        authToken.usedAt = new Date();
        await authToken.save();
        user.passwordHash = await argon2.hash(dto.newPassword, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
        });
        await user.save();
        await this.refreshTokenModel.updateMany({ userId: user._id }, { $set: { isRevoked: true } });
        await this.emailService.sendSecurityAlertEmail(user.email, user.firstName, 'Your AutomaAI account password was recently reset. All active sessions have been terminated.');
        return {
            message: 'Password has been reset successfully. Please log in with your new password.',
        };
    }
    async changePassword(userId, dto) {
        if (dto.newPassword !== dto.confirmNewPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const user = await this.userModel.findById(this.toObjectId(userId)).select('+passwordHash');
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('User not found or password not set');
        }
        const isMatch = await argon2.verify(user.passwordHash, dto.currentPassword);
        if (!isMatch) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        user.passwordHash = await argon2.hash(dto.newPassword, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
        });
        await user.save();
        await this.refreshTokenModel.updateMany({ userId: user._id }, { $set: { isRevoked: true } });
        await this.emailService.sendSecurityAlertEmail(user.email, user.firstName, 'Your AutomaAI password was changed. Active sessions on other devices have been revoked.');
        return {
            message: 'Password changed successfully. Please log in with your new password.',
        };
    }
    async getMe(userId, activeOrgId) {
        const user = await this.userModel.findById(this.toObjectId(userId));
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const memberships = await this.memberModel
            .find({ userId: this.toObjectId(userId), status: 'active' })
            .populate('organizationId')
            .exec();
        const orgList = memberships
            .filter((m) => m.organizationId && !m.organizationId.isDeleted)
            .map((m) => ({
            id: m.organizationId._id,
            name: m.organizationId.name,
            slug: m.organizationId.slug,
            plan: m.organizationId.plan,
            role: m.role,
        }));
        const resolvedOrgId = activeOrgId || (orgList[0]?.id ? orgList[0].id.toString() : undefined);
        let workspaces = [];
        if (resolvedOrgId) {
            workspaces = await this.workspaceModel.find({
                organizationId: this.toObjectId(resolvedOrgId),
                isDeleted: false,
            });
        }
        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName || ''}`.trim(),
                profileImage: user.profileImage,
                phoneNumber: user.phoneNumber,
                emailVerified: user.emailVerified,
                status: user.status,
                systemRole: user.systemRole,
                isMfaEnabled: user.isMfaEnabled,
                authProviders: user.authProviders.map((p) => ({
                    provider: p.provider,
                    connectedAt: p.connectedAt,
                })),
                createdAt: user.createdAt,
            },
            activeOrganizationId: resolvedOrgId,
            organizations: orgList,
            workspaces: workspaces.map((w) => ({
                id: w._id,
                name: w.name,
                slug: w.slug,
                description: w.description,
                isDefault: w.isDefault,
            })),
        };
    }
    async createSession(user, ipAddress, userAgent, orgId, workspaceId, role, rememberMe = false) {
        const authConfig = this.configService.get('auth');
        const family = (0, uuid_1.v4)();
        const rawRefreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = this.hashToken(rawRefreshToken);
        const refreshDays = rememberMe ? 30 : 7;
        const expiresAt = new Date(Date.now() + refreshDays * 24 * 3600 * 1000);
        const refreshTokenDoc = new this.refreshTokenModel({
            userId: user._id,
            tokenHash,
            family,
            expiresAt,
            ipAddress,
            userAgent,
        });
        await refreshTokenDoc.save();
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            systemRole: user.systemRole,
            organizationId: orgId,
            workspaceId,
            role,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: authConfig?.jwtSecret,
            expiresIn: authConfig?.jwtExpiresIn || '15m',
        });
        return {
            accessToken,
            refreshToken: rawRefreshToken,
            tokenType: 'Bearer',
            expiresIn: authConfig?.jwtExpiresIn || '15m',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(organization_schema_1.Organization.name)),
    __param(2, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __param(3, (0, mongoose_1.InjectModel)(workspace_schema_1.Workspace.name)),
    __param(4, (0, mongoose_1.InjectModel)(refresh_token_schema_1.RefreshToken.name)),
    __param(5, (0, mongoose_1.InjectModel)(auth_token_schema_1.AuthToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map