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
var OrganizationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = require("crypto");
const organization_schema_1 = require("./schemas/organization.schema");
const organization_member_schema_1 = require("./schemas/organization-member.schema");
const organization_invitation_schema_1 = require("./schemas/organization-invitation.schema");
const workspace_schema_1 = require("../workspaces/schemas/workspace.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const role_enum_1 = require("../../core/common/enums/role.enum");
const organization_audit_hooks_1 = require("./organization-audit.hooks");
const email_service_1 = require("../../core/auth/services/email/email.service");
const roles_service_1 = require("../roles/roles.service");
const subscriptions_service_1 = require("../billing/services/subscriptions.service");
const common_2 = require("@nestjs/common");
let OrganizationsService = OrganizationsService_1 = class OrganizationsService {
    orgModel;
    memberModel;
    inviteModel;
    workspaceModel;
    userModel;
    auditHooks;
    emailService;
    rolesService;
    subscriptionsService;
    logger = new common_1.Logger(OrganizationsService_1.name);
    constructor(orgModel, memberModel, inviteModel, workspaceModel, userModel, auditHooks, emailService, rolesService, subscriptionsService) {
        this.orgModel = orgModel;
        this.memberModel = memberModel;
        this.inviteModel = inviteModel;
        this.workspaceModel = workspaceModel;
        this.userModel = userModel;
        this.auditHooks = auditHooks;
        this.emailService = emailService;
        this.rolesService = rolesService;
        this.subscriptionsService = subscriptionsService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    hashToken(rawToken) {
        return crypto.createHash('sha256').update(rawToken).digest('hex');
    }
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async create(userId, dto) {
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
        const workspace = new this.workspaceModel({
            organizationId: org._id,
            name: 'Default Workspace',
            slug: 'default',
            isDefault: true,
            description: 'Default production automation workspace',
        });
        await workspace.save();
        const member = new this.memberModel({
            organizationId: org._id,
            userId: this.toObjectId(userId),
            role: role_enum_1.OrganizationRole.OWNER,
            status: 'active',
        });
        await member.save();
        const user = await this.userModel.findById(this.toObjectId(userId));
        if (user && !user.defaultOrganizationId) {
            user.defaultOrganizationId = org._id;
            user.defaultWorkspaceId = workspace._id;
            await user.save();
        }
        if (this.subscriptionsService) {
            await this.subscriptionsService.ensureTrialSubscription(org._id.toString(), userId);
        }
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
            metadata: { memberUserId: userId, role: role_enum_1.OrganizationRole.OWNER },
        });
        return {
            organization: org,
            workspace,
            role: role_enum_1.OrganizationRole.OWNER,
        };
    }
    async getUserOrganizations(userId) {
        const memberships = await this.memberModel
            .find({ userId: this.toObjectId(userId), status: 'active' })
            .populate('organizationId')
            .exec();
        const activeMemberships = memberships.filter((m) => m.organizationId && !m.organizationId.isDeleted);
        const results = await Promise.all(activeMemberships.map(async (m) => {
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
                isOwner: m.role === role_enum_1.OrganizationRole.OWNER || org.ownerId?.toString() === userId,
            };
        }));
        return results;
    }
    async findById(orgId, userId) {
        const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        if (userId) {
            const member = await this.memberModel.findOne({
                organizationId: this.toObjectId(orgId),
                userId: this.toObjectId(userId),
                status: 'active',
            });
            if (!member) {
                throw new common_1.ForbiddenException('Access denied: You are not an active member of this organization');
            }
        }
        return org;
    }
    async findBySlug(slug, userId) {
        const org = await this.orgModel.findOne({ slug: slug.toLowerCase(), isDeleted: false });
        if (!org) {
            throw new common_1.NotFoundException(`Organization with slug '${slug}' not found`);
        }
        if (userId) {
            const member = await this.memberModel.findOne({
                organizationId: org._id,
                userId: this.toObjectId(userId),
                status: 'active',
            });
            if (!member) {
                throw new common_1.ForbiddenException('Access denied: You are not an active member of this organization');
            }
        }
        return org;
    }
    async getCurrentOrg(orgId, userId) {
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
            role: member ? member.role : role_enum_1.OrganizationRole.MEMBER,
            workspaces: workspaces.map((w) => ({
                id: w._id,
                name: w.name,
                slug: w.slug,
                description: w.description,
                isDefault: w.isDefault,
            })),
        };
    }
    async update(orgId, userId, dto) {
        const member = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(userId),
            status: 'active',
        });
        if (!member || (member.role !== role_enum_1.OrganizationRole.OWNER && member.role !== role_enum_1.OrganizationRole.ADMIN)) {
            throw new common_1.ForbiddenException('Only organization owners and administrators can update settings');
        }
        const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        if (dto.status && member.role !== role_enum_1.OrganizationRole.OWNER) {
            throw new common_1.ForbiddenException('Only the organization owner can change organization status');
        }
        if (dto.name !== undefined)
            org.name = dto.name;
        if (dto.logo !== undefined || dto.logoUrl !== undefined) {
            org.logo = dto.logo || dto.logoUrl;
            org.logoUrl = dto.logoUrl || dto.logo;
        }
        if (dto.description !== undefined)
            org.description = dto.description;
        if (dto.industry !== undefined)
            org.industry = dto.industry;
        if (dto.website !== undefined)
            org.website = dto.website;
        if (dto.timezone !== undefined)
            org.timezone = dto.timezone;
        if (dto.country !== undefined)
            org.country = dto.country;
        if (dto.defaultCurrency !== undefined)
            org.defaultCurrency = dto.defaultCurrency;
        if (dto.status !== undefined)
            org.status = dto.status;
        await org.save();
        await this.auditHooks.emit({
            organizationId: org._id.toString(),
            actorUserId: userId,
            eventType: 'organization.settings.updated',
            metadata: dto,
        });
        return org;
    }
    async delete(orgId, userId) {
        const member = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(userId),
            status: 'active',
        });
        if (!member || member.role !== role_enum_1.OrganizationRole.OWNER) {
            throw new common_1.ForbiddenException('Only the organization owner can delete the organization');
        }
        const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        org.isDeleted = true;
        org.deletedAt = new Date();
        org.status = 'cancelled';
        await org.save();
        await this.workspaceModel.updateMany({ organizationId: org._id }, { $set: { isDeleted: true, deletedAt: new Date() } });
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
    async switchOrganization(userId, orgId) {
        const member = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(userId),
            status: 'active',
        });
        if (!member) {
            throw new common_1.ForbiddenException('Access denied: You are not a member of the target organization');
        }
        const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
        if (!org) {
            throw new common_1.NotFoundException('Target organization not found');
        }
        const defaultWorkspace = await this.workspaceModel.findOne({
            organizationId: org._id,
            isDefault: true,
            isDeleted: false,
        });
        await this.userModel.updateOne({ _id: this.toObjectId(userId) }, {
            $set: {
                defaultOrganizationId: org._id,
                defaultWorkspaceId: defaultWorkspace?._id,
            },
        });
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
    async listMembers(orgId, userId) {
        const callerMember = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(userId),
            status: 'active',
        });
        if (!callerMember) {
            throw new common_1.ForbiddenException('Access denied to view organization members');
        }
        const members = await this.memberModel
            .find({ organizationId: this.toObjectId(orgId) })
            .populate('userId', 'firstName lastName email profileImage status')
            .exec();
        return members.map((m) => ({
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
            isOwner: m.role === role_enum_1.OrganizationRole.OWNER,
        }));
    }
    async createInvitation(orgId, currentUserId, dto) {
        const callerMember = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(currentUserId),
            status: 'active',
        });
        if (!callerMember || (callerMember.role !== role_enum_1.OrganizationRole.OWNER && callerMember.role !== role_enum_1.OrganizationRole.ADMIN)) {
            throw new common_1.ForbiddenException('Only owners and administrators can invite members');
        }
        const org = await this.orgModel.findOne({ _id: this.toObjectId(orgId), isDeleted: false });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const inviter = await this.userModel.findById(this.toObjectId(currentUserId));
        const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName || ''}`.trim() : 'Organization Administrator';
        const targetUser = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (targetUser) {
            const existingMember = await this.memberModel.findOne({
                organizationId: this.toObjectId(orgId),
                userId: targetUser._id,
            });
            if (existingMember) {
                throw new common_1.ConflictException('User is already a member of this organization');
            }
        }
        await this.inviteModel.updateMany({ organizationId: this.toObjectId(orgId), email: dto.email.toLowerCase(), status: 'pending' }, { $set: { status: 'revoked' } });
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
        const invitation = new this.inviteModel({
            organizationId: this.toObjectId(orgId),
            email: dto.email.toLowerCase(),
            role: dto.role || role_enum_1.OrganizationRole.MEMBER,
            invitedBy: this.toObjectId(currentUserId),
            tokenHash,
            expiresAt,
            status: 'pending',
        });
        await invitation.save();
        await this.emailService.sendInvitationEmail(dto.email.toLowerCase(), inviterName, org.name, dto.role || 'Member', rawToken);
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
    async listInvitations(orgId, currentUserId) {
        const callerMember = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(currentUserId),
            status: 'active',
        });
        if (!callerMember) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const invites = await this.inviteModel
            .find({ organizationId: this.toObjectId(orgId), status: 'pending', expiresAt: { $gt: new Date() } })
            .populate('invitedBy', 'firstName lastName email')
            .exec();
        return invites.map((inv) => ({
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
    async revokeInvitation(orgId, currentUserId, invitationId) {
        const callerMember = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(currentUserId),
            status: 'active',
        });
        if (!callerMember || (callerMember.role !== role_enum_1.OrganizationRole.OWNER && callerMember.role !== role_enum_1.OrganizationRole.ADMIN)) {
            throw new common_1.ForbiddenException('Only owners and administrators can revoke invitations');
        }
        const invite = await this.inviteModel.findOneAndUpdate({ _id: this.toObjectId(invitationId), organizationId: this.toObjectId(orgId) }, { $set: { status: 'revoked' } }, { new: true });
        if (!invite) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        return {
            success: true,
            message: 'Invitation revoked successfully',
        };
    }
    async validateInvitationToken(rawToken) {
        const tokenHash = this.hashToken(rawToken);
        const invitation = await this.inviteModel
            .findOne({ tokenHash, status: 'pending', expiresAt: { $gt: new Date() } })
            .populate('organizationId', 'name slug logo logoUrl plan')
            .populate('invitedBy', 'firstName lastName email')
            .exec();
        if (!invitation) {
            throw new common_1.BadRequestException('Invalid or expired invitation link');
        }
        return {
            valid: true,
            email: invitation.email,
            role: invitation.role,
            organization: invitation.organizationId,
            invitedBy: invitation.invitedBy
                ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName || ''}`.trim()
                : 'Team Member',
            expiresAt: invitation.expiresAt,
        };
    }
    async acceptInvitation(userId, rawToken) {
        const tokenHash = this.hashToken(rawToken);
        const invitation = await this.inviteModel.findOne({
            tokenHash,
            status: 'pending',
            expiresAt: { $gt: new Date() },
        });
        if (!invitation) {
            throw new common_1.BadRequestException('Invalid or expired invitation link');
        }
        const user = await this.userModel.findById(this.toObjectId(userId));
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
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
        if (!user.defaultOrganizationId && org) {
            user.defaultOrganizationId = org._id;
            const defaultWs = await this.workspaceModel.findOne({ organizationId: org._id, isDefault: true });
            if (defaultWs) {
                user.defaultWorkspaceId = defaultWs._id;
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
    async updateMemberRole(orgId, currentUserId, memberId, newRole) {
        const callerMember = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(currentUserId),
            status: 'active',
        });
        if (!callerMember || (callerMember.role !== role_enum_1.OrganizationRole.OWNER && callerMember.role !== role_enum_1.OrganizationRole.ADMIN)) {
            throw new common_1.ForbiddenException('Only owners and administrators can update member roles');
        }
        const targetMember = await this.memberModel.findOne({
            _id: this.toObjectId(memberId),
            organizationId: this.toObjectId(orgId),
        });
        if (!targetMember) {
            throw new common_1.NotFoundException('Member record not found');
        }
        if (newRole === role_enum_1.OrganizationRole.OWNER && callerMember.role !== role_enum_1.OrganizationRole.OWNER) {
            throw new common_1.ForbiddenException('Only an existing organization Owner can assign the Owner role');
        }
        if (targetMember.role === role_enum_1.OrganizationRole.OWNER && newRole !== role_enum_1.OrganizationRole.OWNER) {
            const ownerCount = await this.memberModel.countDocuments({
                organizationId: this.toObjectId(orgId),
                role: role_enum_1.OrganizationRole.OWNER,
                status: 'active',
            });
            if (ownerCount <= 1) {
                throw new common_1.ForbiddenException('Cannot demote the last remaining organization Owner');
            }
        }
        targetMember.role = newRole;
        await targetMember.save();
        return targetMember;
    }
    async removeMember(orgId, currentUserId, memberId) {
        const callerMember = await this.memberModel.findOne({
            organizationId: this.toObjectId(orgId),
            userId: this.toObjectId(currentUserId),
            status: 'active',
        });
        if (!callerMember || (callerMember.role !== role_enum_1.OrganizationRole.OWNER && callerMember.role !== role_enum_1.OrganizationRole.ADMIN)) {
            throw new common_1.ForbiddenException('Only owners and administrators can remove members');
        }
        const targetMember = await this.memberModel.findOne({
            _id: this.toObjectId(memberId),
            organizationId: this.toObjectId(orgId),
        });
        if (!targetMember) {
            throw new common_1.NotFoundException('Member not found');
        }
        if (targetMember.userId.toString() === currentUserId && targetMember.role === role_enum_1.OrganizationRole.OWNER) {
            throw new common_1.ForbiddenException('Organization owner cannot remove themselves. Transfer ownership or delete the organization.');
        }
        if (targetMember.role === role_enum_1.OrganizationRole.OWNER) {
            const ownerCount = await this.memberModel.countDocuments({
                organizationId: this.toObjectId(orgId),
                role: role_enum_1.OrganizationRole.OWNER,
                status: 'active',
            });
            if (ownerCount <= 1) {
                throw new common_1.ForbiddenException('Cannot remove the last remaining organization Owner');
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
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = OrganizationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(organization_schema_1.Organization.name)),
    __param(1, (0, mongoose_1.InjectModel)(organization_member_schema_1.OrganizationMember.name)),
    __param(2, (0, mongoose_1.InjectModel)(organization_invitation_schema_1.OrganizationInvitation.name)),
    __param(3, (0, mongoose_1.InjectModel)(workspace_schema_1.Workspace.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(8, (0, common_2.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        organization_audit_hooks_1.OrganizationAuditHooks,
        email_service_1.EmailService,
        roles_service_1.RolesService,
        subscriptions_service_1.SubscriptionsService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map