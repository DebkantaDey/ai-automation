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
var LeadScoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadScoringService = void 0;
const common_1 = require("@nestjs/common");
const ai_gateway_service_1 = require("../../../integrations/ai/ai-gateway.service");
let LeadScoringService = LeadScoringService_1 = class LeadScoringService {
    aiGateway;
    logger = new common_1.Logger(LeadScoringService_1.name);
    constructor(aiGateway) {
        this.aiGateway = aiGateway;
    }
    async scoreLead(lead, customPromptContext) {
        try {
            const heuristics = this.evaluateHeuristics(lead);
            const prompt = `You are an expert enterprise B2B sales qualification AI.
Analyze the following lead profile and evaluate their intent, budget, and readiness to purchase:

Lead Information:
- Name: ${lead.name}
- Email: ${lead.email || 'N/A'}
- Phone: ${lead.phone || 'N/A'}
- Company: ${lead.company || 'N/A'}
- Source Channel: ${lead.source}
- Status: ${lead.status}
- Existing Notes: ${lead.notes || 'None'}
- Custom Properties: ${JSON.stringify(lead.customFields || {})}
${customPromptContext ? `- Additional Context: ${customPromptContext}` : ''}

Respond in structured JSON format with the following schema:
{
  "score": <number between 0 and 100>,
  "confidence": <number between 0.0 and 1.0>,
  "priority": <"low" | "medium" | "high">,
  "reasons": [<list of concise, explainable qualification reasons>]
}`;
            const schemaDescription = `{
  "score": number (0-100),
  "confidence": number (0.0-1.0),
  "priority": "low" | "medium" | "high",
  "reasons": string[]
}`;
            const aiResponse = await this.aiGateway.structuredOutput(prompt, schemaDescription, {
                task: 'classify',
                temperature: 0.2,
            });
            if (aiResponse?.data?.score !== undefined) {
                const finalScore = Math.round(aiResponse.data.score * 0.7 + heuristics.score * 0.3);
                const blendedScore = Math.min(100, Math.max(0, finalScore));
                const priority = blendedScore >= 80 ? 'high' : blendedScore >= 55 ? 'medium' : 'low';
                return {
                    score: blendedScore,
                    confidence: aiResponse.data.confidence || 0.88,
                    priority,
                    reasons: aiResponse.data.reasons?.length ? aiResponse.data.reasons : heuristics.reasons,
                };
            }
        }
        catch (err) {
            this.logger.warn(`AI lead scoring fallback triggered for lead [${lead._id}]: ${err?.message}`);
        }
        return this.evaluateHeuristics(lead);
    }
    evaluateHeuristics(lead) {
        let score = 40;
        const reasons = [];
        if (lead.email) {
            const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
            const domain = lead.email.split('@')[1]?.toLowerCase();
            if (domain && !freeProviders.includes(domain)) {
                score += 20;
                reasons.push(`Corporate domain verified (@${domain})`);
            }
            else {
                reasons.push('Personal email provider');
            }
        }
        if (lead.company && lead.company.trim().length > 2) {
            score += 15;
            reasons.push(`Identified company organization: "${lead.company}"`);
        }
        if (lead.source === 'whatsapp') {
            score += 15;
            reasons.push('High-engagement direct WhatsApp communication');
        }
        else if (lead.source === 'referral') {
            score += 20;
            reasons.push('High-trust referral lead');
        }
        const text = (lead.notes || '').toLowerCase();
        if (text.includes('enterprise') || text.includes('demo') || text.includes('pricing') || text.includes('seats')) {
            score += 15;
            reasons.push('Inquired about enterprise pricing, seats, or live demo');
        }
        const finalScore = Math.min(100, Math.max(10, score));
        const priority = finalScore >= 80 ? 'high' : finalScore >= 55 ? 'medium' : 'low';
        return {
            score: finalScore,
            confidence: 0.85,
            priority,
            reasons: reasons.length ? reasons : ['Standard lead intake profile evaluated.'],
        };
    }
};
exports.LeadScoringService = LeadScoringService;
exports.LeadScoringService = LeadScoringService = LeadScoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_gateway_service_1.AiGatewayService])
], LeadScoringService);
//# sourceMappingURL=lead-scoring.service.js.map