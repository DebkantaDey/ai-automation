import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionLimitService } from './services/subscription-limit.service';
import { BillingWebhookService } from './services/billing-webhook.service';
import { UsageService } from './services/usage.service';
import { CreateCheckoutDto, ChangePlanDto } from './dto/create-checkout.dto';
export declare class BillingController {
    private readonly subscriptionsService;
    private readonly limitService;
    private readonly webhookService;
    private readonly usageService;
    constructor(subscriptionsService: SubscriptionsService, limitService: SubscriptionLimitService, webhookService: BillingWebhookService, usageService: UsageService);
    getPlans(): Promise<import("./schemas/plan.schema").PlanDocument[]>;
    getSubscription(orgId: string): Promise<{
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
        statusDetails: import("./services/subscription-status.service").ComputedSubscriptionStatusResult;
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
    getUsage(orgId: string): Promise<{
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
    getInvoices(orgId: string): Promise<import("./schemas/invoice.schema").InvoiceDocument[]>;
    getPayments(orgId: string): Promise<import("./schemas/payment.schema").PaymentDocument[]>;
    createCheckout(orgId: string, userId: string, dto: CreateCheckoutDto): Promise<{
        success: boolean;
        message: string;
        subscription: import("mongoose").Document<unknown, {}, import("./schemas/subscription.schema").SubscriptionDocument, {}, {}> & import("./schemas/subscription.schema").Subscription & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    changePlan(orgId: string, userId: string, dto: ChangePlanDto): Promise<{
        success: boolean;
        message: string;
        subscription: import("mongoose").Document<unknown, {}, import("./schemas/subscription.schema").SubscriptionDocument, {}, {}> & import("./schemas/subscription.schema").Subscription & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    cancelSubscription(orgId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        currentPeriodEnd: Date;
    }>;
    reactivateSubscription(orgId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        currentPeriodEnd: Date;
    }>;
    handleStripeWebhook(signature: string, req: any, body: any): Promise<{
        received: boolean;
        status: string;
        eventId?: string;
    }>;
    handleRazorpayWebhook(signature: string, req: any, body: any): Promise<{
        received: boolean;
        status: string;
        eventId?: string;
    }>;
}
