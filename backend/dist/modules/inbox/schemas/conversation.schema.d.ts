import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ChannelType = 'whatsapp' | 'email' | 'webchat' | 'sms';
export type ConversationStatus = 'open' | 'closed' | 'snoozed';
export type ConversationDocument = Conversation & Document;
export declare class Conversation {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    channel: ChannelType;
    contactName: string;
    contactIdentifier: string;
    customerId?: Types.ObjectId;
    leadId?: Types.ObjectId;
    status: ConversationStatus;
    unreadCount: number;
    lastMessageText: string;
    lastMessageAt: Date;
    assignedUserId?: Types.ObjectId;
    assignedAgentId?: Types.ObjectId;
    isAiHandled: boolean;
    aiTakeoverReason?: string;
    tags: string[];
    metadata?: Record<string, any>;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ConversationSchema: MongooseSchema<Conversation, import("mongoose").Model<Conversation, any, any, any, Document<unknown, any, Conversation, any, {}> & Conversation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Conversation, Document<unknown, {}, import("mongoose").FlatRecord<Conversation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Conversation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
