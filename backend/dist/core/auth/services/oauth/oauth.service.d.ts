import { Model, Types } from 'mongoose';
import { GoogleOAuthProvider } from './providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from './providers/microsoft-oauth.provider';
import { OAuthProviderInterface } from './oauth.interface';
import { User, UserDocument } from '../../../../modules/users/schemas/user.schema';
import { OrganizationDocument } from '../../../../modules/organizations/schemas/organization.schema';
import { OrganizationMemberDocument } from '../../../../modules/organizations/schemas/organization-member.schema';
import { WorkspaceDocument } from '../../../../modules/workspaces/schemas/workspace.schema';
export declare class OAuthService {
    private readonly userModel;
    private readonly orgModel;
    private readonly memberModel;
    private readonly workspaceModel;
    private readonly googleProvider;
    private readonly microsoftProvider;
    private readonly logger;
    private readonly providers;
    constructor(userModel: Model<UserDocument>, orgModel: Model<OrganizationDocument>, memberModel: Model<OrganizationMemberDocument>, workspaceModel: Model<WorkspaceDocument>, googleProvider: GoogleOAuthProvider, microsoftProvider: MicrosoftOAuthProvider);
    getProvider(name: string): OAuthProviderInterface;
    getAuthorizationUrl(providerName: string, state: string): string;
    handleOAuthCallback(providerName: string, code: string, ipAddress?: string, userAgent?: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
