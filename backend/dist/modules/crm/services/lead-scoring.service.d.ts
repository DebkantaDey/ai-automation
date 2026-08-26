import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { LeadDocument } from '../schemas/lead.schema';
export interface LeadScoreResult {
    score: number;
    confidence: number;
    priority: 'low' | 'medium' | 'high';
    reasons: string[];
}
export declare class LeadScoringService {
    private readonly aiGateway;
    private readonly logger;
    constructor(aiGateway: AiGatewayService);
    scoreLead(lead: LeadDocument, customPromptContext?: string): Promise<LeadScoreResult>;
    private evaluateHeuristics;
}
