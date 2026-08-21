import { Model } from 'mongoose';
import { SubscriptionDocument } from '../schemas/subscription.schema';
import { Plan, PlanDocument, PlanLimits } from '../schemas/plan.schema';
import { OrganizationMemberDocument } from '../../organizations/schemas/organization-member.schema';
import { WorkspaceDocument } from '../../workspaces/schemas/workspace.schema';
export declare class SubscriptionLimitService {
    private readonly subscriptionModel;
    private readonly planModel;
    private readonly memberModel;
    private readonly workspaceModel;
    private readonly logger;
    constructor(subscriptionModel: Model<SubscriptionDocument>, planModel: Model<PlanDocument>, memberModel: Model<OrganizationMemberDocument>, workspaceModel: Model<WorkspaceDocument>);
    private toObjectId;
    getPlanLimits(organizationId: string): Promise<{
        plan: Partial<Plan>;
        limits: PlanLimits;
    }>;
    checkLimit(organizationId: string, limitKey: keyof PlanLimits, currentUsage: number): Promise<{
        allowed: boolean;
        limit: number;
        current: number;
        plan: string;
    }>;
    canInviteMember(organizationId: string): Promise<boolean>;
    canCreateWorkspace(organizationId: string): Promise<boolean>;
    canCreateWorkflow(organizationId: string, currentCount?: number): Promise<boolean>;
    canCreateIntegration(organizationId: string, currentCount?: number): Promise<boolean>;
    canExecuteWorkflow(organizationId: string, currentMonthlyExecutions?: number): Promise<boolean>;
    canUseAI(organizationId: string, tokensRequested?: number, currentTokensUsed?: number): Promise<boolean>;
    getUsageOverview(organizationId: string): Promise<{
        plan: Partial<Plan>;
        usage: {
            users: {
                current: number;
                limit: number;
                percentage: number;
            };
            workspaces: {
                current: number;
                limit: number;
                percentage: number;
            };
            workflows: {
                current: number;
                limit: number;
                percentage: number;
            };
            executions: {
                current: number;
                limit: number;
                percentage: number;
            };
            aiExecutions: {
                current: number;
                limit: number;
                percentage: number;
            };
            aiTokens: {
                current: number;
                limit: number;
                percentage: number;
            };
            storage: {
                current: number;
                limit: number;
                percentage: number;
            };
        };
    }>;
}
