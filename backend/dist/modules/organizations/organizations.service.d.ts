import { Model, Types } from 'mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import { OrganizationMember, OrganizationMemberDocument } from './schemas/organization-member.schema';
import { OrganizationInvitationDocument } from './schemas/organization-invitation.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/schemas/workspace.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateOrganizationDto, InviteMemberDto } from './dto/create-org.dto';
import { UpdateOrganizationDto } from './dto/update-org.dto';
import { OrganizationRole } from '../../core/common/enums/role.enum';
import { OrganizationAuditHooks } from './organization-audit.hooks';
import { EmailService } from '../../core/auth/services/email/email.service';
import { RolesService } from '../roles/roles.service';
import { SubscriptionsService } from '../billing/services/subscriptions.service';
export declare class OrganizationsService {
    private readonly orgModel;
    private readonly memberModel;
    private readonly inviteModel;
    private readonly workspaceModel;
    private readonly userModel;
    private readonly auditHooks;
    private readonly emailService;
    private readonly rolesService;
    private readonly subscriptionsService?;
    private readonly logger;
    constructor(orgModel: Model<OrganizationDocument>, memberModel: Model<OrganizationMemberDocument>, inviteModel: Model<OrganizationInvitationDocument>, workspaceModel: Model<WorkspaceDocument>, userModel: Model<UserDocument>, auditHooks: OrganizationAuditHooks, emailService: EmailService, rolesService: RolesService, subscriptionsService?: SubscriptionsService);
    private toObjectId;
    private hashToken;
    private slugify;
    create(userId: string, dto: CreateOrganizationDto): Promise<{
        organization: import("mongoose").Document<unknown, {}, OrganizationDocument, {}, {}> & Organization & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        workspace: import("mongoose").Document<unknown, {}, WorkspaceDocument, {}, {}> & Workspace & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        role: OrganizationRole;
    }>;
    getUserOrganizations(userId: string): Promise<{
        id: any;
        name: any;
        slug: any;
        logo: any;
        logoUrl: any;
        description: any;
        industry: any;
        website: any;
        timezone: any;
        country: any;
        defaultCurrency: any;
        status: any;
        plan: any;
        subscriptionStatus: any;
        role: any;
        joinedAt: any;
        memberCount: number;
        isOwner: boolean;
    }[]>;
    findById(orgId: string, userId?: string): Promise<OrganizationDocument>;
    findBySlug(slug: string, userId?: string): Promise<OrganizationDocument>;
    getCurrentOrg(orgId: string, userId: string): Promise<{
        organization: {
            id: Types.ObjectId;
            name: string;
            slug: string;
            logo: string;
            description: string;
            industry: string;
            website: string;
            timezone: string;
            country: string;
            defaultCurrency: string;
            status: import("./schemas/organization.schema").OrganizationStatus;
            plan: string;
            subscriptionStatus: string;
            createdAt: Date;
        };
        role: OrganizationRole;
        workspaces: {
            id: Types.ObjectId;
            name: string;
            slug: string;
            description: string;
            isDefault: boolean;
        }[];
    }>;
    update(orgId: string, userId: string, dto: UpdateOrganizationDto): Promise<import("mongoose").Document<unknown, {}, OrganizationDocument, {}, {}> & Organization & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(orgId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    switchOrganization(userId: string, orgId: string): Promise<{
        activeOrganization: {
            id: Types.ObjectId;
            name: string;
            slug: string;
            logo: string;
            plan: string;
            role: OrganizationRole;
        };
        defaultWorkspace: {
            id: Types.ObjectId;
            name: string;
            slug: string;
        };
    }>;
    listMembers(orgId: string, userId: string): Promise<{
        id: any;
        userId: any;
        firstName: any;
        lastName: any;
        fullName: string;
        email: any;
        profileImage: any;
        role: any;
        roleId: any;
        status: any;
        joinedAt: any;
        isOwner: boolean;
    }[]>;
    createInvitation(orgId: string, currentUserId: string, dto: InviteMemberDto): Promise<{
        message: string;
        invitation: {
            id: Types.ObjectId;
            email: string;
            role: string;
            expiresAt: Date;
            status: import("./schemas/organization-invitation.schema").InvitationStatus;
        };
    }>;
    listInvitations(orgId: string, currentUserId: string): Promise<{
        id: any;
        email: any;
        role: any;
        invitedBy: string;
        expiresAt: any;
        createdAt: any;
    }[]>;
    revokeInvitation(orgId: string, currentUserId: string, invitationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateInvitationToken(rawToken: string): Promise<{
        valid: boolean;
        email: string;
        role: string;
        organization: Types.ObjectId;
        invitedBy: string;
        expiresAt: Date;
    }>;
    acceptInvitation(userId: string, rawToken: string): Promise<{
        success: boolean;
        message: string;
        organization: import("mongoose").Document<unknown, {}, OrganizationDocument, {}, {}> & Organization & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        role: string;
    }>;
    updateMemberRole(orgId: string, currentUserId: string, memberId: string, newRole: OrganizationRole): Promise<import("mongoose").Document<unknown, {}, OrganizationMemberDocument, {}, {}> & OrganizationMember & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    removeMember(orgId: string, currentUserId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
