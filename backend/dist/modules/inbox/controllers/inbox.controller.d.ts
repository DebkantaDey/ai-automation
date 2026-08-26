import { InboxService } from '../services/inbox.service';
import { SendMessageDto, ToggleAiTakeoverDto, UpdateConversationDto } from '../dto/inbox.dto';
export declare class InboxController {
    private readonly inboxService;
    constructor(inboxService: InboxService);
    listConversations(orgId: string, channel?: string, status?: string, search?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/conversation.schema").ConversationDocument, {}, {}> & import("../schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getConversationById(orgId: string, id: string): Promise<import("../schemas/conversation.schema").ConversationDocument>;
    getMessages(orgId: string, id: string, limit?: number): Promise<import("../schemas/message.schema").MessageDocument[]>;
    sendMessage(orgId: string, userId: string, id: string, dto: SendMessageDto): Promise<import("../schemas/message.schema").MessageDocument>;
    toggleTakeover(orgId: string, userId: string, id: string, dto: ToggleAiTakeoverDto): Promise<import("../schemas/conversation.schema").ConversationDocument>;
    suggestReply(orgId: string, id: string): Promise<import("../services/ai-reply-generator.service").AiReplySuggestion>;
    updateConversation(orgId: string, userId: string, id: string, dto: UpdateConversationDto): Promise<import("../schemas/conversation.schema").ConversationDocument>;
}
