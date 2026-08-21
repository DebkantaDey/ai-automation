import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { OAuthService } from './services/oauth/oauth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/password.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private readonly authService;
    private readonly oauthService;
    private readonly configService;
    constructor(authService: AuthService, oauthService: OAuthService, configService: ConfigService);
    private setAuthCookies;
    private clearAuthCookies;
    register(dto: RegisterDto): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            firstName: string;
            lastName: string;
            emailVerified: boolean;
            status: import("../../modules/users/schemas/user.schema").UserStatus;
        };
        organization: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            slug: string;
            plan: string;
            role: import("../common/enums/role.enum").OrganizationRole;
        };
        workspace: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            slug: string;
        };
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto, req: Request, res: Response, ipAddress: string): Promise<{
        message: string;
        user?: undefined;
        tokens?: undefined;
    } | {
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
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
    login(dto: LoginDto, req: Request, res: Response, ipAddress: string): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
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
            id: import("mongoose").Types.ObjectId;
            name: string;
            slug: string;
            plan: string;
            role: import("../common/enums/role.enum").OrganizationRole;
        };
        workspace: {
            id: import("mongoose").Types.ObjectId;
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
    refreshToken(dto: RefreshTokenDto, req: Request, res: Response, ipAddress: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: string;
    }>;
    logout(dto: RefreshTokenDto, req: Request, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    logoutAll(userId: string, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto, res: Response): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto, res: Response): Promise<{
        message: string;
    }>;
    getMe(userId: string, activeOrgId?: string): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
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
    googleAuth(res: Response): Promise<void>;
    googleCallback(code: string, req: Request, res: Response, ipAddress: string): Promise<void>;
    microsoftAuth(res: Response): Promise<void>;
    microsoftCallback(code: string, req: Request, res: Response, ipAddress: string): Promise<void>;
}
