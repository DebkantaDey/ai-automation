import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ChannelType } from './conversation.schema';
export type MessageDirection = 'inbound' | 'outbound';
export type SenderType = 'customer' | 'ai' | 'human' | 'system';
export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type MessageDocument = Message & Document;
export declare class Message {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    conversationId: Types.ObjectId;
    channel: ChannelType;
    direction: MessageDirection;
    senderType: SenderType;
    senderId?: string;
    senderName: string;
    content: string;
    attachments: Array<{
        type: string;
        url: string;
        name?: string;
        size?: number;
    }>;
    status: MessageDeliveryStatus;
    externalMessageId?: string;
    rawPayload?: Record<string, any>;
    aiGeneratedDraft?: string;
    aiConfidence?: number;
    createdBy?: Types.ObjectId;
    createdAt: Date;
}
export declare const MessageSchema: MongooseSchema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message, any, {}> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
