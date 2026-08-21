import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeBillingProvider } from './providers/stripe.provider';
import { RazorpayBillingProvider } from './providers/razorpay.provider';
import {
  BillingProviderInterface,
  BillingWebhookEvent,
  CheckoutSessionResult,
  SubscriptionDetails,
} from './billing.interface';
import { BillingConfig } from '../../core/config/billing.config';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly providers = new Map<string, BillingProviderInterface>();
  private defaultProviderName: 'stripe' | 'razorpay';

  constructor(
    private readonly configService: ConfigService,
    private readonly stripeProvider: StripeBillingProvider,
    private readonly razorpayProvider: RazorpayBillingProvider,
  ) {
    this.providers.set('stripe', this.stripeProvider);
    this.providers.set('razorpay', this.razorpayProvider);

    const config = this.configService.get<BillingConfig>('billing');
    this.defaultProviderName = config?.defaultProvider || 'stripe';
  }

  public getProvider(name?: string): BillingProviderInterface {
    const key = (name || this.defaultProviderName).toLowerCase();
    const provider = this.providers.get(key);
    if (!provider) {
      throw new NotFoundException(`Billing Provider '${key}' is not registered`);
    }
    return provider;
  }

  async createCustomer(
    email: string,
    name: string,
    orgId: string,
    providerName?: string,
  ): Promise<{ customerId: string; provider: string }> {
    const provider = this.getProvider(providerName);
    const customerId = await provider.createCustomer(email, name, { organizationId: orgId });
    return { customerId, provider: provider.providerName };
  }

  async createSubscriptionCheckout(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    providerName?: string,
  ): Promise<CheckoutSessionResult> {
    const provider = this.getProvider(providerName);
    return provider.createCheckoutSession(customerId, priceId, successUrl, cancelUrl);
  }

  async getSubscription(subscriptionId: string, providerName?: string): Promise<SubscriptionDetails> {
    const provider = this.getProvider(providerName);
    return provider.getSubscription(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string, providerName?: string): Promise<SubscriptionDetails> {
    const provider = this.getProvider(providerName);
    return provider.cancelSubscription(subscriptionId);
  }

  async handleWebhook(
    providerName: string,
    payload: string | Buffer,
    signature: string,
  ): Promise<BillingWebhookEvent> {
    const provider = this.getProvider(providerName);
    return provider.verifyWebhookSignature(payload, signature);
  }
}
