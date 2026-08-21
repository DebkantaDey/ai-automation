import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked';
export type OrganizationInvitationDocument = OrganizationInvitation & Document;
export declare class OrganizationInvitation {
    organizationId: Types.ObjectId;
    email: string;
    role: string;
    roleId?: Types.ObjectId;
    invitedBy: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    status: InvitationStatus;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const OrganizationInvitationSchema: MongooseSchema<OrganizationInvitation, import("mongoose").Model<OrganizationInvitation, any, any, any, Document<unknown, any, OrganizationInvitation, any, {}> & OrganizationInvitation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrganizationInvitation, Document<unknown, {}, import("mongoose").FlatRecord<OrganizationInvitation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<OrganizationInvitation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
