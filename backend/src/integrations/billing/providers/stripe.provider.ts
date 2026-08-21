import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  BillingProviderInterface,
  BillingWebhookEvent,
  CheckoutSessionResult,
  SubscriptionDetails,
} from '../billing.interface';
import { BillingConfig } from '../../../core/config/billing.config';

@Injectable()
export class StripeBillingProvider implements BillingProviderInterface {
  readonly providerName = 'stripe';
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(StripeBillingProvider.name);

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<BillingConfig>('billing');
    if (config?.stripeSecretKey) {
      this.stripe = new Stripe(config.stripeSecretKey, {
        apiVersion: '2024-12-18.acacia' as any,
      });
    }
  }

  private ensureClient(): Stripe {
    if (!this.stripe) {
      const apiKey =
        this.configService.get<string>('billing.stripeSecretKey') || process.env.STRIPE_SECRET_KEY;
      if (!apiKey) {
        throw new Error('Stripe API Key is not configured');
      }
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2024-12-18.acacia' as any,
      });
    }
    return this.stripe;
  }

  async createCustomer(
    email: string,
    name: string,
    metadata: Record<string, string> = {},
  ): Promise<string> {
    const client = this.ensureClient();
    const customer = await client.customers.create({
      email,
      name,
      metadata,
    });
    return customer.id;
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string> = {},
  ): Promise<CheckoutSessionResult> {
    const client = this.ensureClient();
    const session = await client.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      subscription_data: {
        metadata,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const client = this.ensureClient();
    const sub = await client.subscriptions.retrieve(subscriptionId);

    return {
      id: sub.id,
      customerId: sub.customer as string,
      status: sub.status,
      planId: sub.items.data[0]?.price.id || '',
      currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const client = this.ensureClient();
    const sub = await client.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      id: sub.id,
      customerId: sub.customer as string,
      status: sub.status,
      planId: sub.items.data[0]?.price.id || '',
      currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  async reactivateSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const client = this.ensureClient();
    const sub = await client.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return {
      id: sub.id,
      customerId: sub.customer as string,
      status: sub.status,
      planId: sub.items.data[0]?.price.id || '',
      currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
      cancelAtPeriodEnd: false,
    };
  }

  async verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): Promise<BillingWebhookEvent> {
    const client = this.ensureClient();
    const webhookSecret =
      this.configService.get<string>('billing.stripeWebhookSecret') ||
      process.env.STRIPE_WEBHOOK_SECRET ||
      '';

    let event: Stripe.Event;
    try {
      event = client.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Stripe webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Invalid Stripe webhook signature: ${err.message}`);
    }

    const eventType = event.type;
    let customerId: string | undefined;
    let subscriptionId: string | undefined;
    let organizationId: string | undefined;
    let status: string | undefined;
    let planId: string | undefined;
    let amount: number | undefined;
    let currency: string | undefined;
    let invoiceId: string | undefined;
    let paymentId: string | undefined;
    let invoiceUrl: string | undefined;
    let invoicePdf: string | undefined;
    let receiptUrl: string | undefined;
    let paymentMethod: string | undefined;
    let paymentMethodDetails: Record<string, any> | undefined;

    const dataObj = event.data.object as any;

    if (event.type.startsWith('customer.subscription.')) {
      subscriptionId = dataObj.id;
      customerId = dataObj.customer as string;
      status = dataObj.status;
      planId = dataObj.items?.data?.[0]?.price?.id;
      organizationId = dataObj.metadata?.organizationId || dataObj.metadata?.orgId;
    } else if (event.type.startsWith('invoice.')) {
      invoiceId = dataObj.id;
      customerId = dataObj.customer as string;
      subscriptionId = dataObj.subscription as string;
      status = dataObj.status;
      amount = dataObj.amount_paid ? dataObj.amount_paid / 100 : (dataObj.total ? dataObj.total / 100 : 0);
      currency = (dataObj.currency || 'usd').toUpperCase();
      invoiceUrl = dataObj.hosted_invoice_url;
      invoicePdf = dataObj.invoice_pdf;
      paymentId = dataObj.payment_intent as string;
      organizationId =
        dataObj.subscription_details?.metadata?.organizationId ||
        dataObj.metadata?.organizationId ||
        dataObj.metadata?.orgId;
    } else if (event.type === 'checkout.session.completed') {
      customerId = dataObj.customer as string;
      subscriptionId = dataObj.subscription as string;
      organizationId = dataObj.metadata?.organizationId || dataObj.metadata?.orgId;
      amount = dataObj.amount_total ? dataObj.amount_total / 100 : 0;
      currency = (dataObj.currency || 'usd').toUpperCase();
    } else if (event.type.startsWith('payment_intent.')) {
      paymentId = dataObj.id;
      customerId = dataObj.customer as string;
      amount = dataObj.amount ? dataObj.amount / 100 : 0;
      currency = (dataObj.currency || 'usd').toUpperCase();
      status = dataObj.status;
      organizationId = dataObj.metadata?.organizationId || dataObj.metadata?.orgId;
      paymentMethod = dataObj.payment_method_types?.[0];
      if (dataObj.charges?.data?.[0]?.payment_method_details?.card) {
        const card = dataObj.charges.data[0].payment_method_details.card;
        paymentMethodDetails = {
          last4: card.last4,
          brand: card.brand,
          expMonth: card.exp_month,
          expYear: card.exp_year,
        };
        receiptUrl = dataObj.charges.data[0].receipt_url;
      }
    }

    return {
      eventId: event.id,
      provider: 'stripe',
      eventType,
      customerId,
      subscriptionId,
      organizationId,
      status,
      planId,
      amount,
      currency,
      invoiceId,
      paymentId,
      paymentMethod,
      paymentMethodDetails,
      receiptUrl,
      invoiceUrl,
      invoicePdf,
      metadata: dataObj.metadata || {},
      raw: event,
    };
  }
}
