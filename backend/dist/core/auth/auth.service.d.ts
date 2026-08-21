import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../../modules/users/schemas/user.schema';
import { OrganizationDocument } from '../../modules/organizations/schemas/organization.schema';
import { OrganizationMemberDocument } from '../../modules/organizations/schemas/organization-member.schema';
import { WorkspaceDocument } from '../../modules/workspaces/schemas/workspace.schema';
import { RefreshTokenDocument } from './schemas/refresh-token.schema';
import { AuthTokenDocument } from './schemas/auth-token.schema';
import { EmailService } from './services/email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/password.dto';
import { OrganizationRole } from '../common/enums/role.enum';
export declare class AuthService {
    private readonly userModel;
    private readonly orgModel;
    private readonly memberModel;
    private readonly workspaceModel;
    private readonly refreshTokenModel;
    private readonly authTokenModel;
    private readonly jwtService;
    private readonly configService;
    private readonly emailService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, orgModel: Model<OrganizationDocument>, memberModel: Model<OrganizationMemberDocument>, workspaceModel: Model<WorkspaceDocument>, refreshTokenModel: Model<RefreshTokenDocument>, authTokenModel: Model<AuthTokenDocument>, jwtService: JwtService, configService: ConfigService, emailService: EmailService);
    private hashToken;
    private toObjectId;
    private slugify;
    register(dto: RegisterDto): Promise<{
        user: {
            id: Types.ObjectId;
            email: string;
            firstName: string;
            lastName: string;
            emailVerified: boolean;
            status: import("../../modules/users/schemas/user.schema").UserStatus;
        };
        organization: {
            id: Types.ObjectId;
            name: string;
            slug: string;
            plan: string;
            role: OrganizationRole;
        };
        workspace: {
            id: Types.ObjectId;
            name: string;
            slug: string;
        };
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
        user?: undefined;
        tokens?: undefined;
    } | {
        message: string;
        user: {
            id: Types.ObjectId;
            email: string;
            firstName: string;
            lastName: string;
            emailVerified: boolean;
            status: "active" | "suspended" | "deleted";
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            tokenType: string;
            expiresIn: string;
        };
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        user: {
            id: Types.ObjectId;
            email: string;
            firstName: string;
            lastName: string;
            fullName: string;
            profileImage: string;
            emailVerified: boolean;
            status: "active" | "pending";
            systemRole: import("../common/enums/role.enum").SystemRole;
        };
        organization: {
            id: Types.ObjectId;
            name: string;
            slug: string;
            plan: string;
            role: OrganizationRole;
        };
        workspace: {
            id: Types.ObjectId;
            name: string;
            slug: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            tokenType: string;
            expiresIn: string;
        };
    }>;
    refreshToken(rawRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
    }>;
    logout(rawRefreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getMe(userId: string, activeOrgId?: string): Promise<{
        user: {
            id: Types.ObjectId;
            email: string;
            firstName: string;
            lastName: string;
            fullName: string;
            profileImage: string;
            phoneNumber: string;
            emailVerified: boolean;
            status: import("../../modules/users/schemas/user.schema").UserStatus;
            systemRole: import("../common/enums/role.enum").SystemRole;
            isMfaEnabled: boolean;
            authProviders: {
                provider: string;
                connectedAt: Date;
            }[];
            createdAt: Date;
        };
        activeOrganizationId: any;
        organizations: {
            id: any;
            name: any;
            slug: any;
            plan: any;
            role: any;
        }[];
        workspaces: {
            id: any;
            name: any;
            slug: any;
            description: any;
            isDefault: any;
        }[];
    }>;
    createSession(user: UserDocument, ipAddress?: string, userAgent?: string, orgId?: string, workspaceId?: string, role?: string, rememberMe?: boolean): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
    }>;
}
