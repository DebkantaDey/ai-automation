import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleOAuthProvider } from './providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from './providers/microsoft-oauth.provider';
import { OAuthProfile, OAuthProviderInterface } from './oauth.interface';
import { User, UserDocument } from '../../../../modules/users/schemas/user.schema';
import { Organization, OrganizationDocument } from '../../../../modules/organizations/schemas/organization.schema';
import { OrganizationMember, OrganizationMemberDocument } from '../../../../modules/organizations/schemas/organization-member.schema';
import { Workspace, WorkspaceDocument } from '../../../../modules/workspaces/schemas/workspace.schema';
import { OrganizationRole } from '../../../common/enums/role.enum';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly providers = new Map<string, OAuthProviderInterface>();

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name) private readonly memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
    private readonly googleProvider: GoogleOAuthProvider,
    private readonly microsoftProvider: MicrosoftOAuthProvider,
  ) {
    this.providers.set('google', this.googleProvider);
    this.providers.set('microsoft', this.microsoftProvider);
  }

  getProvider(name: string): OAuthProviderInterface {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new NotFoundException(`OAuth provider '${name}' is not supported`);
    }
    return provider;
  }

  getAuthorizationUrl(providerName: string, state: string): string {
    const provider = this.getProvider(providerName);
    return provider.getAuthorizationUrl(state);
  }

  async handleOAuthCallback(providerName: string, code: string, ipAddress?: string, userAgent?: string) {
    const provider = this.getProvider(providerName);
    const profile: OAuthProfile = await provider.authenticate(code);

    if (!profile.email) {
      throw new UnauthorizedException('OAuth provider did not return an email address');
    }

    // 1. Check if user with this linked providerUserId exists
    let user = await this.userModel.findOne({
      'authProviders.provider': profile.provider,
      'authProviders.providerUserId': profile.providerUserId,
    });

    if (user) {
      if (user.status === 'suspended' || user.status === 'deleted') {
        throw new ForbiddenException(`Account is ${user.status}. Please contact support.`);
      }
      user.lastLoginAt = new Date();
      user.lastLoginIp = ipAddress;
      user.lastLoginUserAgent = userAgent;
      await user.save();
      return user;
    }

    // 2. Check if user with this email exists (Account Linking)
    user = await this.userModel.findOne({ email: profile.email.toLowerCase() });

    if (user) {
      if (user.status === 'suspended' || user.status === 'deleted') {
        throw new ForbiddenException(`Account is ${user.status}. Please contact support.`);
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

    // 3. New User Registration via OAuth
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

    // Create Default Organization & Workspace for new OAuth user
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
      role: OrganizationRole.OWNER,
      status: 'active',
    });
    await member.save();

    newUser.defaultOrganizationId = organization._id as any;
    newUser.defaultWorkspaceId = workspace._id as any;
    await newUser.save();

    return newUser;
  }
}
