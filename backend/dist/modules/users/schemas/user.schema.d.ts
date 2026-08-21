import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { SystemRole } from '../../../core/common/enums/role.enum';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'deleted';
export interface AuthProviderInfo {
    provider: 'google' | 'microsoft' | 'local' | string;
    providerUserId: string;
    email?: string;
    connectedAt: Date;
}
export type UserDocument = User & Document;
export declare class User {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash?: string;
    profileImage?: string;
    phoneNumber?: string;
    emailVerified: boolean;
    status: UserStatus;
    lastLoginAt?: Date;
    lastLoginIp?: string;
    lastLoginUserAgent?: string;
    authProviders: AuthProviderInfo[];
    systemRole: SystemRole;
    isMfaEnabled: boolean;
    mfaSecret?: string;
    defaultOrganizationId?: Types.ObjectId;
    defaultWorkspaceId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
