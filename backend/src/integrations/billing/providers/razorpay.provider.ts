import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  BillingProviderInterface,
  BillingWebhookEvent,
  CheckoutSessionResult,
  SubscriptionDetails,
} from '../billing.interface';
import { BillingConfig } from '../../../core/config/billing.config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

@Injectable()
export class RazorpayBillingProvider implements BillingProviderInterface {
  readonly providerName = 'razorpay';
  private razorpay: any = null;
  private readonly logger = new Logger(RazorpayBillingProvider.name);

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<BillingConfig>('billing');
    if (config?.razorpayKeyId && config?.razorpayKeySecret) {
      this.razorpay = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
      });
    }
  }

  private ensureClient(): any {
    if (!this.razorpay) {
      const key_id =
        this.configService.get<string>('billing.razorpayKeyId') || process.env.RAZORPAY_KEY_ID;
      const key_secret =
        this.configService.get<string>('billing.razorpayKeySecret') || process.env.RAZORPAY_KEY_SECRET;
      if (!key_id || !key_secret) {
        throw new Error('Razorpay API keys are not configured');
      }
      this.razorpay = new Razorpay({ key_id, key_secret });
    }
    return this.razorpay;
  }

  async createCustomer(
    email: string,
    name: string,
    metadata: Record<string, string> = {},
  ): Promise<string> {
    const client = this.ensureClient();
    const customer = await client.customers.create({
      name,
      email,
      notes: metadata,
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
    const subscription = await client.subscriptions.create({
      plan_id: priceId,
      customer_notify: 1,
      total_count: 12,
      notes: metadata,
    });

    return {
      sessionId: subscription.id,
      url: subscription.short_url || '',
    };
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const client = this.ensureClient();
    const sub = await client.subscriptions.fetch(subscriptionId);

    return {
      id: sub.id,
      customerId: sub.customer_id,
      status: sub.status,
      planId: sub.plan_id,
      currentPeriodEnd: new Date(sub.current_end * 1000),
      cancelAtPeriodEnd: sub.ended_at ? true : false,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const client = this.ensureClient();
    const sub = await client.subscriptions.cancel(subscriptionId, false);

    return {
      id: sub.id,
      customerId: sub.customer_id,
      status: sub.status,
      planId: sub.plan_id,
      currentPeriodEnd: new Date(sub.current_end * 1000),
      cancelAtPeriodEnd: true,
    };
  }

  async reactivateSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const client = this.ensureClient();
    const sub = await client.subscriptions.resume(subscriptionId, { resume_at: 'now' });

    return {
      id: sub.id,
      customerId: sub.customer_id,
      status: sub.status,
      planId: sub.plan_id,
      currentPeriodEnd: new Date(sub.current_end * 1000),
      cancelAtPeriodEnd: false,
    };
  }

  async verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): Promise<BillingWebhookEvent> {
    const secret =
      this.configService.get<string>('billing.razorpayWebhookSecret') ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      '';
    const body = typeof payload === 'string' ? payload : payload.toString('utf8');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      this.logger.error('Razorpay webhook HMAC signature mismatch');
      throw new BadRequestException('Invalid Razorpay webhook signature');
    }

    const parsed = JSON.parse(body);
    const eventType = parsed.event;
    const eventId = parsed.payload?.payment?.entity?.id || parsed.payload?.subscription?.entity?.id || `${Date.now()}_${Math.random()}`;

    const subEntity = parsed.payload?.subscription?.entity;
    const paymentEntity = parsed.payload?.payment?.entity;
    const invoiceEntity = parsed.payload?.invoice?.entity;

    const customerId = subEntity?.customer_id || paymentEntity?.customer_id;
    const subscriptionId = subEntity?.id || paymentEntity?.subscription_id;
    const status = subEntity?.status || paymentEntity?.status;
    const planId = subEntity?.plan_id;
    const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : (invoiceEntity?.amount ? invoiceEntity.amount / 100 : undefined);
    const currency = (paymentEntity?.currency || invoiceEntity?.currency || 'INR').toUpperCase();
    const paymentId = paymentEntity?.id;
    const invoiceId = invoiceEntity?.id;
    const paymentMethod = paymentEntity?.method;

    let paymentMethodDetails: Record<string, any> | undefined;
    if (paymentEntity?.card) {
      paymentMethodDetails = {
        last4: paymentEntity.card.last4,
        brand: paymentEntity.card.network,
        bank: paymentEntity.bank,
        wallet: paymentEntity.wallet,
      };
    }

    const metadata = subEntity?.notes || paymentEntity?.notes || {};
    const organizationId = metadata?.organizationId || metadata?.orgId;

    return {
      eventId: parsed.id || eventId,
      provider: 'razorpay',
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
      metadata,
      raw: parsed,
    };
  }
}
