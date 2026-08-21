import { Model } from 'mongoose';
import { UsageRecordDocument } from '../schemas/usage-record.schema';
import { SubscriptionLimitService } from './subscription-limit.service';
export interface RecordAIUsageDto {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    costUsd?: number;
}
export declare class UsageService {
    private readonly usageModel;
    private readonly limitService;
    private readonly logger;
    constructor(usageModel: Model<UsageRecordDocument>, limitService: SubscriptionLimitService);
    private toObjectId;
    getCurrentPeriodKey(): string;
    getOrCreatePeriodUsage(organizationId: string): Promise<UsageRecordDocument>;
    recordWorkflowExecution(organizationId: string): Promise<void>;
    recordAIUsage(organizationId: string, stats: RecordAIUsageDto): Promise<void>;
    recordAPIRequest(organizationId: string): Promise<void>;
    recordStorage(organizationId: string, deltaBytes: number): Promise<void>;
    recordDocuments(organizationId: string, deltaCount: number): Promise<void>;
    recordIntegrationsCount(organizationId: string, count: number): Promise<void>;
    checkLimit(organizationId: string, metric: 'workflowExecutions' | 'aiExecutions' | 'apiRequests' | 'storage'): Promise<void>;
    getUsageOverview(organizationId: string): Promise<{
        period: string;
        metrics: {
            workflowExecutions: {
                used: number;
                limit: number;
                percent: number;
            };
            aiExecutions: {
                used: number;
                limit: number;
                percent: number;
            };
            aiTokens: {
                total: number;
                prompt: number;
                completion: number;
                costUsd: number;
            };
            apiRequests: {
                used: number;
                limit: number;
                percent: number;
            };
            storage: {
                usedBytes: number;
                usedMb: number;
                limitMb: number;
            };
            integrations: {
                used: number;
                limit: number;
            };
        };
        plan: {
            name: string;
            slug: string;
        };
    }>;
}
