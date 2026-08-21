import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type AuthTokenType = 'email_verification' | 'password_reset';
export type AuthTokenDocument = AuthToken & Document;
export declare class AuthToken {
    userId: Types.ObjectId;
    tokenHash: string;
    type: AuthTokenType;
    isUsed: boolean;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
}
export declare const AuthTokenSchema: MongooseSchema<AuthToken, import("mongoose").Model<AuthToken, any, any, any, Document<unknown, any, AuthToken, any, {}> & AuthToken & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuthToken, Document<unknown, {}, import("mongoose").FlatRecord<AuthToken>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<AuthToken> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
