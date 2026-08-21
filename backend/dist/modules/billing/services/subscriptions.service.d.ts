import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { PlanDocument } from '../schemas/plan.schema';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { OrganizationDocument } from '../../organizations/schemas/organization.schema';
import { UserDocument } from '../../users/schemas/user.schema';
import { BillingService } from '../../../integrations/billing/billing.service';
import { SubscriptionLimitService } from './subscription-limit.service';
import { SubscriptionStatusService } from './subscription-status.service';
import { SubscriptionEventsService } from './subscription-events.service';
import { CreateCheckoutDto, ChangePlanDto } from '../dto/create-checkout.dto';
export declare class SubscriptionsService implements OnModuleInit {
    private readonly planModel;
    private readonly subscriptionModel;
    private readonly orgModel;
    private readonly userModel;
    private readonly configService;
    private readonly billingService;
    private readonly limitService;
    private readonly statusService;
    private readonly eventsService;
    private readonly logger;
    constructor(planModel: Model<PlanDocument>, subscriptionModel: Model<SubscriptionDocument>, orgModel: Model<OrganizationDocument>, userModel: Model<UserDocument>, configService: ConfigService, billingService: BillingService, limitService: SubscriptionLimitService, statusService: SubscriptionStatusService, eventsService: SubscriptionEventsService);
    private toObjectId;
    onModuleInit(): Promise<void>;
    ensureDefaultPlans(): Promise<void>;
    getPublicPlans(): Promise<PlanDocument[]>;
    getPlanBySlug(slug: string): Promise<PlanDocument>;
    ensureTrialSubscription(organizationId: string, userId?: string): Promise<SubscriptionDocument>;
    getOrganizationSubscription(organizationId: string): Promise<{
        subscription: {
            id: any;
            organizationId: any;
            status: any;
            provider: any;
            billingInterval: any;
            currentPeriodStart: any;
            currentPeriodEnd: any;
            trialStart: any;
            trialEnd: any;
            cancelAtPeriodEnd: any;
            cancelledAt: any;
            plan: any;
        };
        statusDetails: import("./subscription-status.service").ComputedSubscriptionStatusResult;
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
    createCheckout(organizationId: string, userId: string, dto: CreateCheckoutDto): Promise<{
        success: boolean;
        message: string;
        subscription: import("mongoose").Document<unknown, {}, SubscriptionDocument, {}, {}> & Subscription & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    } | {
        sessionId: string;
        checkoutUrl: string;
        plan: string;
        interval: "monthly" | "yearly";
        provider: "stripe" | "razorpay";
    }>;
    changePlan(organizationId: string, userId: string, dto: ChangePlanDto): Promise<{
        success: boolean;
        message: string;
        subscription: import("mongoose").Document<unknown, {}, SubscriptionDocument, {}, {}> & Subscription & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    cancelSubscription(organizationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        currentPeriodEnd: Date;
    }>;
    reactivateSubscription(organizationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        currentPeriodEnd: Date;
    }>;
}
