import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, InviteMemberDto } from './dto/create-org.dto';
import { UpdateOrganizationDto } from './dto/update-org.dto';
import { OrganizationRole } from '../../core/common/enums/role.enum';
export declare class OrganizationsController {
    private readonly orgService;
    constructor(orgService: OrganizationsService);
    createOrg(userId: string, dto: CreateOrganizationDto): Promise<{
        organization: import("mongoose").Document<unknown, {}, import("./schemas/organization.schema").OrganizationDocument, {}, {}> & import("./schemas/organization.schema").Organization & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        workspace: import("mongoose").Document<unknown, {}, import("../workspaces/schemas/workspace.schema").WorkspaceDocument, {}, {}> & import("../workspaces/schemas/workspace.schema").Workspace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        role: OrganizationRole;
    }>;
    getMyOrganizations(userId: string): Promise<{
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
    getCurrentOrg(orgId: string, userId: string): Promise<{
        organization: {
            id: import("mongoose").Types.ObjectId;
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
            id: import("mongoose").Types.ObjectId;
            name: string;
            slug: string;
            description: string;
            isDefault: boolean;
        }[];
    }>;
    getBySlug(slug: string, userId: string): Promise<import("./schemas/organization.schema").OrganizationDocument>;
    getById(id: string, userId: string): Promise<import("./schemas/organization.schema").OrganizationDocument>;
    updateOrg(id: string, userId: string, dto: UpdateOrganizationDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/organization.schema").OrganizationDocument, {}, {}> & import("./schemas/organization.schema").Organization & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteOrg(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    switchOrg(id: string, userId: string): Promise<{
        activeOrganization: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            slug: string;
            logo: string;
            plan: string;
            role: OrganizationRole;
        };
        defaultWorkspace: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            slug: string;
        };
    }>;
    listMembers(id: string, userId: string): Promise<{
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
    updateMemberRole(id: string, memberId: string, userId: string, role: OrganizationRole): Promise<import("mongoose").Document<unknown, {}, import("./schemas/organization-member.schema").OrganizationMemberDocument, {}, {}> & import("./schemas/organization-member.schema").OrganizationMember & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    removeMember(id: string, memberId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    inviteMember(id: string, userId: string, dto: InviteMemberDto): Promise<{
        message: string;
        invitation: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            role: string;
            expiresAt: Date;
            status: import("./schemas/organization-invitation.schema").InvitationStatus;
        };
    }>;
    listInvitations(id: string, userId: string): Promise<{
        id: any;
        email: any;
        role: any;
        invitedBy: string;
        expiresAt: any;
        createdAt: any;
    }[]>;
    revokeInvitation(id: string, inviteId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateInvite(token: string): Promise<{
        valid: boolean;
        email: string;
        role: string;
        organization: import("mongoose").Types.ObjectId;
        invitedBy: string;
        expiresAt: Date;
    }>;
    acceptInvite(userId: string, token: string): Promise<{
        success: boolean;
        message: string;
        organization: import("mongoose").Document<unknown, {}, import("./schemas/organization.schema").OrganizationDocument, {}, {}> & import("./schemas/organization.schema").Organization & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        role: string;
    }>;
}
