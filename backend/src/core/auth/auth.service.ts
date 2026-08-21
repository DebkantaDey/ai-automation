import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';
import { Organization, OrganizationDocument } from '../../modules/organizations/schemas/organization.schema';
import { OrganizationMember, OrganizationMemberDocument } from '../../modules/organizations/schemas/organization-member.schema';
import { Workspace, WorkspaceDocument } from '../../modules/workspaces/schemas/workspace.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { AuthToken, AuthTokenDocument } from './schemas/auth-token.schema';
import { EmailService } from './services/email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/password.dto';
import { AuthConfig } from '../config/auth.config';
import { OrganizationRole } from '../common/enums/role.enum';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name) private readonly memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(AuthToken.name) private readonly authTokenModel: Model<AuthTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
    });

    // 1. Create User in pending verification state
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

    // 2. Create Default Organization
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

    // 3. Create Default Workspace
    const workspace = new this.workspaceModel({
      organizationId: organization._id,
      name: 'Default Workspace',
      slug: 'default',
      isDefault: true,
      description: 'Default production automation workspace',
    });
    await workspace.save();

    // 4. Create Member
    const member = new this.memberModel({
      organizationId: organization._id,
      userId: user._id,
      role: OrganizationRole.OWNER,
      status: 'active',
    });
    await member.save();

    user.defaultOrganizationId = organization._id as any;
    user.defaultWorkspaceId = workspace._id as any;
    await user.save();

    // 5. Generate Email Verification Token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawVerificationToken);

    const authToken = new this.authTokenModel({
      userId: user._id,
      tokenHash,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // 24 hours
    });
    await authToken.save();

    // Dispatch verification email asynchronously
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
        role: OrganizationRole.OWNER,
      },
      workspace: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
      },
      message: 'Registration successful. A verification link has been sent to your email address.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
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
      throw new BadRequestException('Invalid or expired verification token');
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

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (user && !user.emailVerified && user.status !== 'deleted') {
      await this.authTokenModel.updateMany(
        { userId: user._id, type: 'email_verification', isUsed: false },
        { $set: { isUsed: true } },
      );

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

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+passwordHash')
      .exec();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenException('Your account has been suspended. Please contact support.');
    }
    if (user.status === 'deleted') {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Resolve tenant context
    let orgId = user.defaultOrganizationId ? user.defaultOrganizationId.toString() : undefined;
    let role = OrganizationRole.MEMBER;

    if (orgId) {
      const member = await this.memberModel.findOne({
        organizationId: this.toObjectId(orgId),
        userId: user._id,
        status: 'active',
      });
      if (member) {
        role = member.role;
      } else {
        const anyMember = await this.memberModel.findOne({ userId: user._id, status: 'active' });
        if (anyMember) {
          orgId = anyMember.organizationId.toString();
          role = anyMember.role;
        }
      }
    } else {
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

  async refreshToken(rawRefreshToken: string, ipAddress?: string, userAgent?: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const existingToken = await this.refreshTokenModel.findOne({ tokenHash });

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Token Replay Detection
    if (existingToken.isRevoked) {
      this.logger.warn(`Security Alert: Replay attack detected for token family [${existingToken.family}]. Revoking entire family.`);
      await this.refreshTokenModel.updateMany(
        { family: existingToken.family },
        { $set: { isRevoked: true } },
      );
      throw new UnauthorizedException('Security alert: Revoked token reused. Session chain terminated.');
    }

    if (existingToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired. Please log in again.');
    }

    const user = await this.userModel.findById(existingToken.userId);
    if (!user || user.status === 'suspended' || user.status === 'deleted') {
      throw new UnauthorizedException('User account inactive or not found');
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

    const authConfig = this.configService.get<AuthConfig>('auth');
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      systemRole: user.systemRole,
      organizationId: user.defaultOrganizationId?.toString(),
      workspaceId: user.defaultWorkspaceId?.toString(),
      role: OrganizationRole.MEMBER,
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

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.refreshTokenModel.updateOne({ tokenHash }, { $set: { isRevoked: true } });
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.refreshTokenModel.updateMany(
      { userId: this.toObjectId(userId) },
      { $set: { isRevoked: true } },
    );
    return { success: true, message: 'Successfully logged out from all devices' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });

    if (user && user.status !== 'deleted' && user.status !== 'suspended') {
      await this.authTokenModel.updateMany(
        { userId: user._id, type: 'password_reset', isUsed: false },
        { $set: { isUsed: true } },
      );

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(rawToken);

      const authToken = new this.authTokenModel({
        userId: user._id,
        tokenHash,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      });
      await authToken.save();

      await this.emailService.sendPasswordResetEmail(user.email, user.firstName, rawToken);
    }

    return {
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
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
      throw new BadRequestException('Invalid or expired password reset token');
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

    await this.refreshTokenModel.updateMany(
      { userId: user._id },
      { $set: { isRevoked: true } },
    );

    await this.emailService.sendSecurityAlertEmail(
      user.email,
      user.firstName,
      'Your AutomaAI account password was recently reset. All active sessions have been terminated.',
    );

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findById(this.toObjectId(userId)).select('+passwordHash');
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('User not found or password not set');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
    });
    await user.save();

    await this.refreshTokenModel.updateMany(
      { userId: user._id },
      { $set: { isRevoked: true } },
    );

    await this.emailService.sendSecurityAlertEmail(
      user.email,
      user.firstName,
      'Your AutomaAI password was changed. Active sessions on other devices have been revoked.',
    );

    return {
      message: 'Password changed successfully. Please log in with your new password.',
    };
  }

  async getMe(userId: string, activeOrgId?: string) {
    const user = await this.userModel.findById(this.toObjectId(userId));
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const memberships = await this.memberModel
      .find({ userId: this.toObjectId(userId), status: 'active' })
      .populate('organizationId')
      .exec();

    const orgList = memberships
      .filter((m) => m.organizationId && !(m.organizationId as any).isDeleted)
      .map((m: any) => ({
        id: m.organizationId._id,
        name: m.organizationId.name,
        slug: m.organizationId.slug,
        plan: m.organizationId.plan,
        role: m.role,
      }));

    const resolvedOrgId = activeOrgId || (orgList[0]?.id ? orgList[0].id.toString() : undefined);

    let workspaces: any[] = [];
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

  async createSession(
    user: UserDocument,
    ipAddress?: string,
    userAgent?: string,
    orgId?: string,
    workspaceId?: string,
    role?: string,
    rememberMe = false,
  ) {
    const authConfig = this.configService.get<AuthConfig>('auth');
    const family = uuidv4();
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

    const payload: JwtPayload = {
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
}
