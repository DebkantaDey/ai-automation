export interface BillingCustomer {
  id: string;
  email: string;
  name: string;
  orgId: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface SubscriptionDetails {
  id: string;
  customerId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'cancelled' | 'paused' | string;
  planId: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface BillingWebhookEvent {
  eventId: string;
  provider: 'stripe' | 'razorpay';
  eventType:
    | 'checkout.session.completed'
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.deleted'
    | 'subscription.authenticated'
    | 'subscription.charged'
    | 'subscription.pending'
    | 'subscription.cancelled'
    | 'invoice.paid'
    | 'invoice.payment_succeeded'
    | 'invoice.payment_failed'
    | 'payment_intent.succeeded'
    | 'payment_intent.payment_failed'
    | string;
  customerId?: string;
  subscriptionId?: string;
  organizationId?: string;
  status?: string;
  planId?: string;
  amount?: number;
  currency?: string;
  invoiceId?: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentMethodDetails?: Record<string, any>;
  receiptUrl?: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  metadata?: Record<string, any>;
  raw: any;
}

export interface BillingProviderInterface {
  readonly providerName: string;
  createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<string>;
  createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>,
  ): Promise<CheckoutSessionResult>;
  getSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
  cancelSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
  reactivateSubscription(subscriptionId: string): Promise<SubscriptionDetails>;
  verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<BillingWebhookEvent>;
}
