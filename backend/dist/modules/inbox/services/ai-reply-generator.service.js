"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiReplyGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReplyGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const ai_gateway_service_1 = require("../../../integrations/ai/ai-gateway.service");
let AiReplyGeneratorService = AiReplyGeneratorService_1 = class AiReplyGeneratorService {
    aiGateway;
    logger = new common_1.Logger(AiReplyGeneratorService_1.name);
    constructor(aiGateway) {
        this.aiGateway = aiGateway;
    }
    async generateReply(conversation, recentMessages, customerContext) {
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
            const aiResponse = await this.aiGateway.structuredOutput(prompt, schemaDescription, {
                task: 'generate',
                temperature: 0.3,
            });
            if (aiResponse?.data?.replyText) {
                return {
                    replyText: aiResponse.data.replyText,
                    confidence: aiResponse.data.confidence || 0.9,
                    reasoning: aiResponse.data.reasoning || 'Contextual reply generated.',
                };
            }
        }
        catch (err) {
            this.logger.warn(`AI reply generator fallback: ${err.message}`);
        }
        return {
            replyText: `Hello ${conversation.contactName}, thank you for reaching out! A member of our team is reviewing your message and will get back to you shortly.`,
            confidence: 0.7,
            reasoning: 'Standard greeting template fallback.',
        };
    }
};
exports.AiReplyGeneratorService = AiReplyGeneratorService;
exports.AiReplyGeneratorService = AiReplyGeneratorService = AiReplyGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_gateway_service_1.AiGatewayService])
], AiReplyGeneratorService);
//# sourceMappingURL=ai-reply-generator.service.js.map