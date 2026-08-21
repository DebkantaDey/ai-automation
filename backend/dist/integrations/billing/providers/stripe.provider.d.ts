import { ConfigService } from '@nestjs/config';
import { BillingProviderInterface, BillingWebhookEvent, CheckoutSessionResult, SubscriptionDetails } from '../billing.interface';
export declare class StripeBillingProvider implements BillingProviderInterface {
    private readonly configService;
    readonly providerName = "stripe";
    private stripe;
    private readonly logger;
    constructor(configService: ConfigService);
    private ensureClient;
    createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<string>;
    createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string, metadata?: Record<string, string>): Promise<CheckoutSessionResult>;
    getSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
    cancelSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
    reactivateSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
    verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<BillingWebhookEvent>;
}
