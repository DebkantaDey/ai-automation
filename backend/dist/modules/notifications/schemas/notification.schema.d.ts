import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare class Notification {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    userId?: Types.ObjectId;
    title: string;
    message: string;
    type: string;
    event: string;
    isRead: boolean;
    channel: string;
    linkUrl?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotificationSchema: MongooseSchema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
