import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type RoleDocument = Role & Document;
export declare class Role {
    name: string;
    slug: string;
    description: string;
    organizationId?: Types.ObjectId;
    permissions: string[];
    isSystemRole: boolean;
    isCustom: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RoleSchema: MongooseSchema<Role, import("mongoose").Model<Role, any, any, any, Document<unknown, any, Role, any, {}> & Role & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Role, Document<unknown, {}, import("mongoose").FlatRecord<Role>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Role> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
