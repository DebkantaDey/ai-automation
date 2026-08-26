import { Injectable, Logger } from '@nestjs/common';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { ConversationDocument } from '../schemas/conversation.schema';
import { MessageDocument } from '../schemas/message.schema';

export interface AiReplySuggestion {
  replyText: string;
  confidence: number;
  reasoning: string;
}

@Injectable()
export class AiReplyGeneratorService {
  private readonly logger = new Logger(AiReplyGeneratorService.name);

  constructor(private readonly aiGateway: AiGatewayService) {}

  /**
   * Generates a context-aware AI suggested reply draft based on conversation thread and customer profile
   */
  async generateReply(
    conversation: ConversationDocument,
    recentMessages: MessageDocument[],
    customerContext?: any,
  ): Promise<AiReplySuggestion> {
    try {
      const messagesFormatted = recentMessages
        .slice(-10)
        .map((m) => `${m.senderName} (${m.senderType}): ${m.content}`)
        .join('\n');

      const prompt = `You are an expert AI customer success and sales assistant.
Generate a polite, helpful, and concise response to the customer's latest message.

Customer Information:
- Contact Name: ${conversation.contactName}
- Channel: ${conversation.channel}
- Identifier: ${conversation.contactIdentifier}
${customerContext ? `- Company: ${customerContext.company || 'N/A'}\n- Plan Tier: ${customerContext.tier || 'N/A'}` : ''}

Recent Conversation Thread:
${messagesFormatted || 'No prior messages'}

Generate the response in structured JSON with:
- "replyText": The exact text to send to the customer. Keep it friendly, direct, and actionable.
- "confidence": Float between 0.0 and 1.0 representing confidence in the draft.
- "reasoning": 1 sentence explaining why this reply is appropriate.`;

      const schemaDescription = `{
  "replyText": string,
  "confidence": number,
  "reasoning": string
}`;

      const aiResponse = await this.aiGateway.structuredOutput<AiReplySuggestion>(
        prompt,
        schemaDescription,
        {
          task: 'generate',
          temperature: 0.3,
        },
      );

      if (aiResponse?.data?.replyText) {
        return {
          replyText: aiResponse.data.replyText,
          confidence: aiResponse.data.confidence || 0.9,
          reasoning: aiResponse.data.reasoning || 'Contextual reply generated.',
        };
      }
    } catch (err: any) {
      this.logger.warn(`AI reply generator fallback: ${err.message}`);
    }

    // Default Fallback
    return {
      replyText: `Hello ${conversation.contactName}, thank you for reaching out! A member of our team is reviewing your message and will get back to you shortly.`,
      confidence: 0.7,
      reasoning: 'Standard greeting template fallback.',
    };
  }
}
