import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import { OrganizationMember, OrganizationMemberDocument } from './schemas/organization-member.schema';
import {
  OrganizationInvitation,
  OrganizationInvitationDocument,
} from './schemas/organization-invitation.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/schemas/workspace.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateOrganizationDto, InviteMemberDto } from './dto/create-org.dto';
import { UpdateOrganizationDto } from './dto/update-org.dto';
import { OrganizationRole } from '../../core/common/enums/role.enum';
import { OrganizationAuditHooks } from './organization-audit.hooks';
import { EmailService } from '../../core/auth/services/email/email.service';
import { RolesService } from '../roles/roles.service';
import { SubscriptionsService } from '../billing/services/subscriptions.service';
import { Optional } from '@nestjs/common';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name) private readonly memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(OrganizationInvitation.name)
    private readonly inviteModel: Model<OrganizationInvitationDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly auditHooks: OrganizationAuditHooks,
    private readonly emailService: EmailService,
    private readonly rolesService: RolesService,
    @Optional() private readonly subscriptionsService?: SubscriptionsService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(userId: string, dto: CreateOrganizationDto) {
    const baseSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.orgModel.findOne({ slug, isDeleted: false })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const org = new this.orgModel({
      name: dto.name,
      slug,
      logo: dto.logo || dto.logoUrl,
      logoUrl: dto.logoUrl || dto.logo,
      description: dto.description || '',
      industry: dto.industry || 'Technology',
      website: dto.website || '',
      timezone: dto.timezone || 'UTC',
      country: dto.country || 'US',
      defaultCurrency: dto.defaultCurrency || 'USD',
      ownerId: this.toObjectId(userId),
      status: 'active',
      plan: 'free',
      subscriptionStatus: 'active',
    });
    await org.save();

    // 1. Create Default Workspace
    const workspace = new this.workspaceModel({
      organizationId: org._id,
      name: 'Default Workspace',
      slug: 'default',
      isDefault: true,
      description: 'Default production automation workspace',
    });
    await workspace.save();

    // 2. Add creator as OWNER in OrganizationMember collection
    const member = new this.memberModel({
      organizationId: org._id,
      userId: this.toObjectId(userId),
      role: OrganizationRole.OWNER,
      status: 'active',
    });
    await member.save();

    // 3. Set as user default if not set
    const user = await this.userModel.findById(this.toObjectId(userId));
    if (user && !user.defaultOrganizationId) {
      user.defaultOrganizationId = org._id as any;
      user.defaultWorkspaceId = workspace._id as any;
      await user.save();
    }

    // 4. Provision Trial Subscription if billing service is available
    if (this.subscriptionsService) {
      await this.subscriptionsService.ensureTrialSubscription(org._id.toString(), userId);
    }

    // 5. Dispatch Audit Hooks
    await this.auditHooks.emit({
      organizationId: org._id.toString(),
      actorUserId: userId,
      eventType: 'organization.created',
      metadata: { name: org.name, slug: org.slug, industry: org.industry },
    });

    await this.auditHooks.emit({
      organizationId: org._id.toString(),
      actorUserId: userId,
      eventType: 'organization.member.added',
      metadata: { memberUserId: userId, role: OrganizationRole.OWNER },
    });

    return {
      organization: org,
      workspace,
      role: OrganizationRole.OWNER,
    };
  }

  async getUserOrganizations(userId: string) {
    const memberships = await this.memberModel
      .find({ userId: this.toObjectId(userId), status: 'active' })
      .populate('organizationId')
      .exec();

    const activeMemberships = memberships.filter(
      (m) => m.organizationId && !(m.organizationId as any).isDeleted,
    );

    const results = await Promise.all(
      activeMemberships.map(async (m: any) => {
        const org = m.organizationId;
        const memberCount = await this.memberModel.countDocuments({
          organizationId: org._id,
          status: 'active',
        });

        return {
          id: org._id,
          name: org.name,
          slug: org.slug,
          logo: org.logo || org.logoUrl,
          logoUrl: org.logoUrl || org.logo,
          description: org.description,
          industry: org.industry,
          website: org.website,
          timezone: org.timezone,
          country: org.country,
          defaultCurrency: org.defaultCurrency,
          status: org.status,
          plan: org.plan,
          subscriptionStatus: org.subscriptionStatus,
          role: m.role,
          joinedAt: m.joinedAt,
          memberCount,
          isOwner: m.role === OrganizationRole.OWNER || org.ownerId?.toString() === userId,
        };
      }),
    );

    return results;
  }

  async findById(orgId: string, userId?: string): Promise<OrganizationDocument> {
    const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (userId) {
      const member = await this.memberModel.findOne({
        organizationId: this.toObjectId(orgId),
        userId: this.toObjectId(userId),
        status: 'active',
      });
      if (!member) {
        throw new ForbiddenException('Access denied: You are not an active member of this organization');
      }
    }

    return org;
  }

  async findBySlug(slug: string, userId?: string): Promise<OrganizationDocument> {
    const org = await this.orgModel.findOne({ slug: slug.toLowerCase(), isDeleted: false });
    if (!org) {
      throw new NotFoundException(`Organization with slug '${slug}' not found`);
    }

    if (userId) {
      const member = await this.memberModel.findOne({
        organizationId: org._id,
        userId: this.toObjectId(userId),
        status: 'active',
      });
      if (!member) {
        throw new ForbiddenException('Access denied: You are not an active member of this organization');
      }
    }

    return org;
  }

  async getCurrentOrg(orgId: string, userId: string) {
    const org = await this.findById(orgId, userId);
    const member = await this.memberModel.findOne({
      organizationId: org._id,
      userId: this.toObjectId(userId),
      status: 'active',
    });

    const workspaces = await this.workspaceModel.find({
      organizationId: org._id,
      isDeleted: false,
    });

    return {
      organization: {
        id: org._id,
        name: org.name,
        slug: org.slug,
        logo: org.logo || org.logoUrl,
        description: org.description,
        industry: org.industry,
        website: org.website,
        timezone: org.timezone,
        country: org.country,
        defaultCurrency: org.defaultCurrency,
        status: org.status,
        plan: org.plan,
        subscriptionStatus: org.subscriptionStatus,
        createdAt: org.createdAt,
      },
      role: member ? member.role : OrganizationRole.MEMBER,
      workspaces: workspaces.map((w) => ({
        id: w._id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        isDefault: w.isDefault,
      })),
    };
  }

  async update(orgId: string, userId: string, dto: UpdateOrganizationDto) {
    const member = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(userId),
      status: 'active',
    });

    if (!member || (member.role !== OrganizationRole.OWNER && member.role !== OrganizationRole.ADMIN)) {
      throw new ForbiddenException('Only organization owners and administrators can update settings');
    }

    const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (dto.status && member.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException('Only the organization owner can change organization status');
    }

    if (dto.name !== undefined) org.name = dto.name;
    if (dto.logo !== undefined || dto.logoUrl !== undefined) {
      org.logo = dto.logo || dto.logoUrl;
      org.logoUrl = dto.logoUrl || dto.logo;
    }
    if (dto.description !== undefined) org.description = dto.description;
    if (dto.industry !== undefined) org.industry = dto.industry;
    if (dto.website !== undefined) org.website = dto.website;
    if (dto.timezone !== undefined) org.timezone = dto.timezone;
    if (dto.country !== undefined) org.country = dto.country;
    if (dto.defaultCurrency !== undefined) org.defaultCurrency = dto.defaultCurrency;
    if (dto.status !== undefined) org.status = dto.status;

    await org.save();

    await this.auditHooks.emit({
      organizationId: org._id.toString(),
      actorUserId: userId,
      eventType: 'organization.settings.updated',
      metadata: dto,
    });

    return org;
  }

  async delete(orgId: string, userId: string) {
    const member = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(userId),
      status: 'active',
    });

    if (!member || member.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException('Only the organization owner can delete the organization');
    }

    const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    org.isDeleted = true;
    org.deletedAt = new Date();
    org.status = 'cancelled';
    await org.save();

    await this.workspaceModel.updateMany(
      { organizationId: org._id },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );

    await this.auditHooks.emit({
      organizationId: org._id.toString(),
      actorUserId: userId,
      eventType: 'organization.deleted',
    });

    return {
      success: true,
      message: `Organization '${org.name}' has been deleted successfully`,
    };
  }

  async switchOrganization(userId: string, orgId: string) {
    const member = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(userId),
      status: 'active',
    });

    if (!member) {
      throw new ForbiddenException('Access denied: You are not a member of the target organization');
    }

    const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
    if (!org) {
      throw new NotFoundException('Target organization not found');
    }

    const defaultWorkspace = await this.workspaceModel.findOne({
      organizationId: org._id,
      isDefault: true,
      isDeleted: false,
    });

    await this.userModel.updateOne(
      { _id: this.toObjectId(userId) },
      {
        $set: {
          defaultOrganizationId: org._id,
          defaultWorkspaceId: defaultWorkspace?._id,
        },
      },
    );

    return {
      activeOrganization: {
        id: org._id,
        name: org.name,
        slug: org.slug,
        logo: org.logo || org.logoUrl,
        plan: org.plan,
        role: member.role,
      },
      defaultWorkspace: defaultWorkspace
        ? {
            id: defaultWorkspace._id,
            name: defaultWorkspace.name,
            slug: defaultWorkspace.slug,
          }
        : null,
    };
  }

  async listMembers(orgId: string, userId: string) {
    const callerMember = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(userId),
      status: 'active',
    });

    if (!callerMember) {
      throw new ForbiddenException('Access denied to view organization members');
    }

    const members = await this.memberModel
      .find({ organizationId: this.toObjectId(orgId) })
      .populate('userId', 'firstName lastName email profileImage status')
      .exec();

    return members.map((m: any) => ({
      id: m._id,
      userId: m.userId?._id,
      firstName: m.userId?.firstName,
      lastName: m.userId?.lastName,
      fullName: `${m.userId?.firstName || ''} ${m.userId?.lastName || ''}`.trim(),
      email: m.userId?.email,
      profileImage: m.userId?.profileImage,
      role: m.role,
      roleId: m.roleId,
      status: m.status,
      joinedAt: m.joinedAt,
      isOwner: m.role === OrganizationRole.OWNER,
    }));
  }

  // --- TOKEN-BASED INVITATION SYSTEM ---

  async createInvitation(orgId: string, currentUserId: string, dto: InviteMemberDto) {
    const callerMember = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(currentUserId),
      status: 'active',
    });

    if (!callerMember || (callerMember.role !== OrganizationRole.OWNER && callerMember.role !== OrganizationRole.ADMIN)) {
      throw new ForbiddenException('Only owners and administrators can invite members');
    }

    const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const inviter = await this.userModel.findById(this.toObjectId(currentUserId));
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName || ''}`.trim() : 'Organization Administrator';

    // Check if user is already a member
    const targetUser = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (targetUser) {
      const existingMember = await this.memberModel.findOne({
        organizationId: this.toObjectId(orgId),
        userId: targetUser._id,
      });
      if (existingMember) {
        throw new ConflictException('User is already a member of this organization');
      }
    }

    // Invalidate existing pending invitations for this email in this org
    await this.inviteModel.updateMany(
      { organizationId: this.toObjectId(orgId), email: dto.email.toLowerCase(), status: 'pending' },
      { $set: { status: 'revoked' } },
    );

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

    const invitation = new this.inviteModel({
      organizationId: this.toObjectId(orgId),
      email: dto.email.toLowerCase(),
      role: dto.role || OrganizationRole.MEMBER,
      invitedBy: this.toObjectId(currentUserId),
      tokenHash,
      expiresAt,
      status: 'pending',
    });
    await invitation.save();

    await this.emailService.sendInvitationEmail(
      dto.email.toLowerCase(),
      inviterName,
      org.name,
      dto.role || 'Member',
      rawToken,
    );

    await this.auditHooks.emit({
      organizationId: orgId,
      actorUserId: currentUserId,
      eventType: 'organization.member.added',
      metadata: { invitedEmail: dto.email, role: dto.role },
    });

    return {
      message: `Invitation successfully sent to ${dto.email}`,
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      },
    };
  }

  async listInvitations(orgId: string, currentUserId: string) {
    const callerMember = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(currentUserId),
      status: 'active',
    });

    if (!callerMember) {
      throw new ForbiddenException('Access denied');
    }

    const invites = await this.inviteModel
      .find({ organizationId: this.toObjectId(orgId), status: 'pending', expiresAt: { $gt: new Date() } })
      .populate('invitedBy', 'firstName lastName email')
      .exec();

    return invites.map((inv: any) => ({
      id: inv._id,
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invitedBy
        ? `${inv.invitedBy.firstName} ${inv.invitedBy.lastName || ''}`.trim()
        : 'Administrator',
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
    }));
  }

  async revokeInvitation(orgId: string, currentUserId: string, invitationId: string) {
    const callerMember = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(currentUserId),
      status: 'active',
    });

    if (!callerMember || (callerMember.role !== OrganizationRole.OWNER && callerMember.role !== OrganizationRole.ADMIN)) {
      throw new ForbiddenException('Only owners and administrators can revoke invitations');
    }

    const invite = await this.inviteModel.findOneAndUpdate(
      { _id: this.toObjectId(invitationId), organizationId: this.toObjectId(orgId) },
      { $set: { status: 'revoked' } },
      { new: true },
    );

    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    return {
      success: true,
      message: 'Invitation revoked successfully',
    };
  }

  async validateInvitationToken(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const invitation = await this.inviteModel
      .findOne({ tokenHash, status: 'pending', expiresAt: { $gt: new Date() } })
      .populate('organizationId', 'name slug logo logoUrl plan')
      .populate('invitedBy', 'firstName lastName email')
      .exec();

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation link');
    }

    return {
      valid: true,
      email: invitation.email,
      role: invitation.role,
      organization: invitation.organizationId,
      invitedBy: invitation.invitedBy
        ? `${(invitation.invitedBy as any).firstName} ${(invitation.invitedBy as any).lastName || ''}`.trim()
        : 'Team Member',
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(userId: string, rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const invitation = await this.inviteModel.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation link');
    }

    const user = await this.userModel.findById(this.toObjectId(userId));
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already a member
    const existingMember = await this.memberModel.findOne({
      organizationId: invitation.organizationId,
      userId: user._id,
    });

    if (!existingMember) {
      const member = new this.memberModel({
        organizationId: invitation.organizationId,
        userId: user._id,
        role: invitation.role,
        roleId: invitation.roleId,
        status: 'active',
        invitedBy: invitation.invitedBy,
      });
      await member.save();
    }

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    const org = await this.orgModel.findById(invitation.organizationId);

    // Set default org if not set
    if (!user.defaultOrganizationId && org) {
      user.defaultOrganizationId = org._id as any;
      const defaultWs = await this.workspaceModel.findOne({ organizationId: org._id, isDefault: true });
      if (defaultWs) {
        user.defaultWorkspaceId = defaultWs._id as any;
      }
      await user.save();
    }

    return {
      success: true,
      message: `Successfully joined ${org?.name || 'organization'}`,
      organization: org,
      role: invitation.role,
    };
  }

  // --- MEMBER ROLE & REMOVAL WITH OWNER PROTECTION ---

  async updateMemberRole(orgId: string, currentUserId: string, memberId: string, newRole: OrganizationRole) {
    const callerMember = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(currentUserId),
      status: 'active',
    });

    if (!callerMember || (callerMember.role !== OrganizationRole.OWNER && callerMember.role !== OrganizationRole.ADMIN)) {
      throw new ForbiddenException('Only owners and administrators can update member roles');
    }

    const targetMember = await this.memberModel.findOne({
      _id: this.toObjectId(memberId),
      organizationId: this.toObjectId(orgId),
    });

    if (!targetMember) {
      throw new NotFoundException('Member record not found');
    }

    // Rule 1: Non-owners cannot elevate members to OWNER
    if (newRole === OrganizationRole.OWNER && callerMember.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException('Only an existing organization Owner can assign the Owner role');
    }

    // Rule 2: Last Owner Protection - cannot demote the last remaining Owner
    if (targetMember.role === OrganizationRole.OWNER && newRole !== OrganizationRole.OWNER) {
      const ownerCount = await this.memberModel.countDocuments({
        organizationId: this.toObjectId(orgId),
        role: OrganizationRole.OWNER,
        status: 'active',
      });

      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot demote the last remaining organization Owner');
      }
    }

    targetMember.role = newRole;
    await targetMember.save();

    return targetMember;
  }

  async removeMember(orgId: string, currentUserId: string, memberId: string) {
    const callerMember = await this.memberModel.findOne({
      organizationId: this.toObjectId(orgId),
      userId: this.toObjectId(currentUserId),
      status: 'active',
    });

    if (!callerMember || (callerMember.role !== OrganizationRole.OWNER && callerMember.role !== OrganizationRole.ADMIN)) {
      throw new ForbiddenException('Only owners and administrators can remove members');
    }

    const targetMember = await this.memberModel.findOne({
      _id: this.toObjectId(memberId),
      organizationId: this.toObjectId(orgId),
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    // Rule 1: Organization Owner cannot remove themselves
    if (targetMember.userId.toString() === currentUserId && targetMember.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Organization owner cannot remove themselves. Transfer ownership or delete the organization.');
    }

    // Rule 2: Last Owner Protection - cannot remove the last owner
    if (targetMember.role === OrganizationRole.OWNER) {
      const ownerCount = await this.memberModel.countDocuments({
        organizationId: this.toObjectId(orgId),
        role: OrganizationRole.OWNER,
        status: 'active',
      });

      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot remove the last remaining organization Owner');
      }
    }

    await this.memberModel.deleteOne({ _id: targetMember._id });

    await this.auditHooks.emit({
      organizationId: orgId,
      actorUserId: currentUserId,
      eventType: 'organization.member.removed',
      metadata: { removedUserId: targetMember.userId.toString() },
    });

    return {
      success: true,
      message: 'Member removed from organization successfully',
    };
  }
}
