import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { OrganizationRole } from '../../../core/common/enums/role.enum';
export type OrganizationMemberStatus = 'active' | 'invited' | 'suspended';
export type OrganizationMemberDocument = OrganizationMember & Document;
export declare class OrganizationMember {
    organizationId: Types.ObjectId;
    userId: Types.ObjectId;
    role: OrganizationRole;
    roleId?: Types.ObjectId;
    status: OrganizationMemberStatus;
    invitedBy?: Types.ObjectId;
    joinedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const OrganizationMemberSchema: MongooseSchema<OrganizationMember, import("mongoose").Model<OrganizationMember, any, any, any, Document<unknown, any, OrganizationMember, any, {}> & OrganizationMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrganizationMember, Document<unknown, {}, import("mongoose").FlatRecord<OrganizationMember>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<OrganizationMember> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
