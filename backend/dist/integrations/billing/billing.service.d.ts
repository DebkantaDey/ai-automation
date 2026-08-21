import { ConfigService } from '@nestjs/config';
import { StripeBillingProvider } from './providers/stripe.provider';
import { RazorpayBillingProvider } from './providers/razorpay.provider';
import { BillingProviderInterface, BillingWebhookEvent, CheckoutSessionResult, SubscriptionDetails } from './billing.interface';
export declare class BillingService {
    private readonly configService;
    private readonly stripeProvider;
    private readonly razorpayProvider;
    private readonly logger;
    private readonly providers;
    private defaultProviderName;
    constructor(configService: ConfigService, stripeProvider: StripeBillingProvider, razorpayProvider: RazorpayBillingProvider);
    getProvider(name?: string): BillingProviderInterface;
    createCustomer(email: string, name: string, orgId: string, providerName?: string): Promise<{
        customerId: string;
        provider: string;
    }>;
    createSubscriptionCheckout(customerId: string, priceId: string, successUrl: string, cancelUrl: string, providerName?: string): Promise<CheckoutSessionResult>;
    getSubscription(subscriptionId: string, providerName?: string): Promise<SubscriptionDetails>;
    cancelSubscription(subscriptionId: string, providerName?: string): Promise<SubscriptionDetails>;
    handleWebhook(providerName: string, payload: string | Buffer, signature: string): Promise<BillingWebhookEvent>;
}
