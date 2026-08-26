import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from '../schemas/conversation.schema';
import { MessageDocument } from '../schemas/message.schema';
import { CustomerDocument } from '../../crm/schemas/customer.schema';
import { CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import { SendMessageDto, ToggleAiTakeoverDto, UpdateConversationDto, InboundMessagePayloadDto } from '../dto/inbox.dto';
import { WhatsAppService } from './whatsapp.service';
import { EmailChannelService } from './email-channel.service';
import { AiReplyGeneratorService } from './ai-reply-generator.service';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class InboxService {
    private readonly conversationModel;
    private readonly messageModel;
    private readonly customerModel;
    private readonly activityModel;
    private readonly whatsappService;
    private readonly emailService;
    private readonly aiReplyService;
    private readonly eventBus;
    private readonly logger;
    constructor(conversationModel: Model<ConversationDocument>, messageModel: Model<MessageDocument>, customerModel: Model<CustomerDocument>, activityModel: Model<CustomerActivityDocument>, whatsappService: WhatsAppService, emailService: EmailChannelService, aiReplyService: AiReplyGeneratorService, eventBus: EventBusService);
    private toObjectId;
    listConversations(organizationId: string, query?: {
        channel?: string;
        status?: string;
        isAiHandled?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, ConversationDocument, {}, {}> & Conversation & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    getConversationById(organizationId: string, id: string): Promise<ConversationDocument>;
    getMessages(organizationId: string, conversationId: string, limit?: number): Promise<MessageDocument[]>;
    sendMessage(organizationId: string, conversationId: string, userId: string, dto: SendMessageDto): Promise<MessageDocument>;
    processInboundMessage(organizationId: string, dto: InboundMessagePayloadDto, workspaceId?: string): Promise<{
        conversation: ConversationDocument;
        message: MessageDocument;
        aiReply?: string;
    }>;
    toggleTakeover(organizationId: string, conversationId: string, userId: string, dto: ToggleAiTakeoverDto): Promise<ConversationDocument>;
    suggestReply(organizationId: string, conversationId: string): Promise<import("./ai-reply-generator.service").AiReplySuggestion>;
    updateConversation(organizationId: string, conversationId: string, userId: string, dto: UpdateConversationDto): Promise<ConversationDocument>;
}
