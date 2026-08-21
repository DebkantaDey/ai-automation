import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type NotificationPreferenceDocument = NotificationPreference & Document;
export declare class NotificationPreference {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    userId: Types.ObjectId;
    channels: {
        inApp: boolean;
        email: boolean;
        slack: boolean;
        webhook: boolean;
    };
    events: Record<string, boolean>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotificationPreferenceSchema: MongooseSchema<NotificationPreference, import("mongoose").Model<NotificationPreference, any, any, any, Document<unknown, any, NotificationPreference, any, {}> & NotificationPreference & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationPreference, Document<unknown, {}, import("mongoose").FlatRecord<NotificationPreference>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<NotificationPreference> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
