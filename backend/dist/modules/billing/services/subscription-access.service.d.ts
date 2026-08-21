import { Model } from 'mongoose';
import { SubscriptionDocument } from '../schemas/subscription.schema';
import { SubscriptionStatusService } from './subscription-status.service';
import { SubscriptionLimitService } from './subscription-limit.service';
export declare class SubscriptionAccessService {
    private readonly subscriptionModel;
    private readonly statusService;
    private readonly limitService;
    private readonly logger;
    constructor(subscriptionModel: Model<SubscriptionDocument>, statusService: SubscriptionStatusService, limitService: SubscriptionLimitService);
    private toObjectId;
    checkMutationAccess(organizationId: string): Promise<boolean>;
    canCreateWorkflow(organizationId: string, currentCount?: number): Promise<boolean>;
    canExecuteWorkflow(organizationId: string, currentCount?: number): Promise<boolean>;
    canUseAI(organizationId: string, tokensRequested?: number, currentTokens?: number): Promise<boolean>;
    canConnectIntegration(organizationId: string, currentCount?: number): Promise<boolean>;
    canInviteMembers(organizationId: string): Promise<boolean>;
    canCreateWorkspace(organizationId: string): Promise<boolean>;
}
