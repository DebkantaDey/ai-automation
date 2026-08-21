import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type WorkspaceStatus = 'active' | 'archived' | 'suspended';
export type WorkspaceDocument = Workspace & Document;
export declare class Workspace {
    organizationId: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    createdBy?: Types.ObjectId;
    status: WorkspaceStatus;
    color: string;
    icon: string;
    timezone: string;
    isDefault: boolean;
    settings: Record<string, any>;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WorkspaceSchema: MongooseSchema<Workspace, import("mongoose").Model<Workspace, any, any, any, Document<unknown, any, Workspace, any, {}> & Workspace & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Workspace, Document<unknown, {}, import("mongoose").FlatRecord<Workspace>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Workspace> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
