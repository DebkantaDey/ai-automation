import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { ConversationDocument } from '../schemas/conversation.schema';
import { MessageDocument } from '../schemas/message.schema';
export interface AiReplySuggestion {
    replyText: string;
    confidence: number;
    reasoning: string;
}
export declare class AiReplyGeneratorService {
    private readonly aiGateway;
    private readonly logger;
    constructor(aiGateway: AiGatewayService);
    generateReply(conversation: ConversationDocument, recentMessages: MessageDocument[], customerContext?: any): Promise<AiReplySuggestion>;
}
