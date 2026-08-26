import { Injectable, Logger } from '@nestjs/common';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { LeadDocument } from '../schemas/lead.schema';

export interface LeadScoreResult {
  score: number;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  reasons: string[];
}

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  constructor(private readonly aiGateway: AiGatewayService) {}

  /**
   * Evaluates and calculates structured lead score (0-100), confidence, priority, and explainable reasons.
   */
  async scoreLead(lead: LeadDocument, customPromptContext?: string): Promise<LeadScoreResult> {
    try {
      // 1. Rule-Based Heuristic Baseline
      const heuristics = this.evaluateHeuristics(lead);

      // 2. AI Semantic Intent Reasoning
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

      const aiResponse = await this.aiGateway.structuredOutput<LeadScoreResult>(
        prompt,
        schemaDescription,
        {
          task: 'classify',
          temperature: 0.2,
        },
      );

      if (aiResponse?.data?.score !== undefined) {
        // Blend AI score with rule-based heuristics
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
    } catch (err: any) {
      this.logger.warn(`AI lead scoring fallback triggered for lead [${lead._id}]: ${err?.message}`);
    }

    // Fallback to Rule-Based Heuristics
    return this.evaluateHeuristics(lead);
  }

  /**
   * Deterministic rule-based scoring engine for reliable offline or fallback evaluation.
   */
  private evaluateHeuristics(lead: LeadDocument): LeadScoreResult {
    let score = 40; // Base score
    const reasons: string[] = [];

    // Corporate email domain vs free mail
    if (lead.email) {
      const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
      const domain = lead.email.split('@')[1]?.toLowerCase();
      if (domain && !freeProviders.includes(domain)) {
        score += 20;
        reasons.push(`Corporate domain verified (@${domain})`);
      } else {
        reasons.push('Personal email provider');
      }
    }

    // Verified Company Name
    if (lead.company && lead.company.trim().length > 2) {
      score += 15;
      reasons.push(`Identified company organization: "${lead.company}"`);
    }

    // Source Intent
    if (lead.source === 'whatsapp') {
      score += 15;
      reasons.push('High-engagement direct WhatsApp communication');
    } else if (lead.source === 'referral') {
      score += 20;
      reasons.push('High-trust referral lead');
    }

    // Notes keywords
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
}
