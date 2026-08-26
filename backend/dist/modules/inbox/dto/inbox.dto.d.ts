import { ChannelType, ConversationStatus } from '../schemas/conversation.schema';
export declare class SendMessageDto {
    content: string;
    channel?: ChannelType;
    attachments?: Array<{
        type: string;
        url: string;
        name?: string;
        size?: number;
    }>;
}
export declare class ToggleAiTakeoverDto {
    isAiHandled: boolean;
    reason?: string;
}
export declare class UpdateConversationDto {
    status?: ConversationStatus;
    assignedUserId?: string;
    tags?: string[];
}
export declare class InboundMessagePayloadDto {
    channel: ChannelType;
    senderIdentifier: string;
    senderName: string;
    content: string;
    externalMessageId?: string;
    rawPayload?: Record<string, any>;
}
