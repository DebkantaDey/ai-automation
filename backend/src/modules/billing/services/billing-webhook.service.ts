import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebhookEvent, WebhookEventDocument } from '../schemas/webhook-event.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { Organization, OrganizationDocument } from '../../organizations/schemas/organization.schema';
import { BillingService } from '../../../integrations/billing/billing.service';
import { SubscriptionEventsService } from './subscription-events.service';
import { SubscriptionStatusService } from './subscription-status.service';
import { BillingWebhookEvent } from '../../../integrations/billing/billing.interface';

@Injectable()
export class BillingWebhookService {
  private readonly logger = new Logger(BillingWebhookService.name);

  constructor(
    @InjectModel(WebhookEvent.name) private readonly webhookEventModel: Model<WebhookEventDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    private readonly billingService: BillingService,
    private readonly eventsService: SubscriptionEventsService,
    private readonly statusService: SubscriptionStatusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async handleWebhook(
    provider: 'stripe' | 'razorpay',
    payload: string | Buffer,
    signature: string,
  ): Promise<{ received: boolean; status: string; eventId?: string }> {
    if (!signature) {
      throw new BadRequestException(`Missing ${provider} webhook signature header`);
    }

    const providerClient = this.billingService.getProvider(provider);
    const event: BillingWebhookEvent = await providerClient.verifyWebhookSignature(payload, signature);

    // 1. Idempotency Check: Ignore already processed events
    const existing = await this.webhookEventModel.findOne({
      provider,
      providerEventId: event.eventId,
    });

    if (existing && existing.status === 'processed') {
      this.logger.warn(`Duplicate webhook event ignored: [${provider}:${event.eventId}]`);
      return { received: true, status: 'already_processed', eventId: event.eventId };
    }

    const webhookRecord =
      existing ||
      new this.webhookEventModel({
        provider,
        providerEventId: event.eventId,
        eventType: event.eventType,
        status: 'processed',
        payload: event.raw,
      });

    try {
      await this.processEvent(event);
      webhookRecord.status = 'processed';
      webhookRecord.processedAt = new Date();
      await webhookRecord.save();

      return { received: true, status: 'processed', eventId: event.eventId };
    } catch (err: any) {
      this.logger.error(`Failed to process webhook event [${event.eventId}]: ${err.message}`, err.stack);
      webhookRecord.status = 'failed';
      webhookRecord.error = err.message;
      await webhookRecord.save();
      throw err;
    }
  }

  private async processEvent(event: BillingWebhookEvent): Promise<void> {
    const org = await this.resolveOrganization(event);

    if (!org) {
      this.logger.warn(
        `Unable to resolve organization for webhook event [${event.provider}:${event.eventType}] (Sub: ${event.subscriptionId}, Cust: ${event.customerId})`,
      );
      return;
    }

    const orgId = org._id;

    // Resolve subscription
    let subscription = await this.subscriptionModel.findOne({
      $or: [
        { organizationId: orgId },
        { providerSubscriptionId: event.subscriptionId },
        { providerCustomerId: event.customerId },
      ],
    });

    const eventType = event.eventType.toLowerCase();

    // 1. Checkout Session Completed / Subscription Activated
    if (
      eventType === 'checkout.session.completed' ||
      eventType === 'customer.subscription.created' ||
      eventType === 'subscription.authenticated'
    ) {
      let targetPlan: PlanDocument | null = null;
      if (event.metadata?.planSlug) {
        targetPlan = await this.planModel.findOne({ slug: event.metadata.planSlug.toLowerCase() });
      }

      if (!targetPlan && event.planId) {
        targetPlan = await this.planModel.findOne({
          $or: [
            { [`providerReferences.${event.provider}.monthlyPriceId`]: event.planId },
            { [`providerReferences.${event.provider}.yearlyPriceId`]: event.planId },
          ],
        });
      }

      if (!targetPlan) {
        targetPlan = await this.planModel.findOne({ slug: 'starter' });
      }

      if (subscription) {
        this.statusService.validateTransition(subscription.status, 'active');
        if (targetPlan) subscription.planId = targetPlan._id as any;
        subscription.status = 'active';
        subscription.provider = event.provider;
        if (event.subscriptionId) subscription.providerSubscriptionId = event.subscriptionId;
        if (event.customerId) subscription.providerCustomerId = event.customerId;
        subscription.currentPeriodStart = new Date();
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        subscription.cancelAtPeriodEnd = false;
        subscription.cancelledAt = undefined;
        await subscription.save();
      }

      if (targetPlan) {
        org.plan = targetPlan.slug;
        await org.save();
      }

      await this.eventsService.emit({
        organizationId: orgId.toString(),
        subscriptionId: subscription?._id?.toString() || 'unknown',
        eventType: 'subscription.created',
        currentStatus: 'active',
        planSlug: targetPlan?.slug || 'starter',
        timestamp: new Date(),
      });
    }

    // 2. Invoice Paid / Payment Succeeded
    if (
      eventType === 'invoice.paid' ||
      eventType === 'invoice.payment_succeeded' ||
      eventType === 'subscription.charged' ||
      eventType === 'payment_intent.succeeded'
    ) {
      if (subscription) {
        subscription.status = 'active';
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        await subscription.save();
      }

      // Record Payment Record
      if (event.paymentId || event.amount) {
        const paymentId = event.paymentId || `pay_${event.eventId}`;
        const paymentRecord = await this.paymentModel.findOneAndUpdate(
          { provider: event.provider, providerPaymentId: paymentId },
          {
            $set: {
              organizationId: orgId,
              subscriptionId: subscription?._id,
              provider: event.provider,
              providerPaymentId: paymentId,
              amount: event.amount || 0,
              currency: event.currency || 'USD',
              status: 'succeeded',
              paymentMethod: event.paymentMethod || 'card',
              paymentMethodDetails: event.paymentMethodDetails,
              receiptUrl: event.receiptUrl,
              metadata: event.metadata,
            },
          },
          { upsert: true, new: true },
        );
      }

      // Record Invoice Record
      if (event.invoiceId) {
        await this.invoiceModel.findOneAndUpdate(
          { provider: event.provider, providerInvoiceId: event.invoiceId },
          {
            $set: {
              organizationId: orgId,
              subscriptionId: subscription?._id,
              provider: event.provider,
              providerInvoiceId: event.invoiceId,
              amount: event.amount || 0,
              amountPaid: event.amount || 0,
              currency: event.currency || 'USD',
              status: 'paid',
              invoiceUrl: event.invoiceUrl,
              invoicePdf: event.invoicePdf,
              paidAt: new Date(),
              metadata: event.metadata,
            },
          },
          { upsert: true, new: true },
        );
      }

      await this.eventsService.emit({
        organizationId: orgId.toString(),
        subscriptionId: subscription?._id?.toString() || 'unknown',
        eventType: 'subscription.renewed',
        currentStatus: 'active',
        planSlug: org.plan || 'starter',
        timestamp: new Date(),
        metadata: { amount: event.amount, currency: event.currency },
      });
    }

    // 3. Payment Failed / Invoice Payment Failed
    if (
      eventType === 'invoice.payment_failed' ||
      eventType === 'payment_intent.payment_failed' ||
      eventType === 'subscription.pending'
    ) {
      if (subscription) {
        this.statusService.validateTransition(subscription.status, 'past_due');
        subscription.status = 'past_due';
        await subscription.save();
      }

      if (event.paymentId || event.amount) {
        const paymentId = event.paymentId || `pay_failed_${event.eventId}`;
        await this.paymentModel.findOneAndUpdate(
          { provider: event.provider, providerPaymentId: paymentId },
          {
            $set: {
              organizationId: orgId,
              subscriptionId: subscription?._id,
              provider: event.provider,
              providerPaymentId: paymentId,
              amount: event.amount || 0,
              currency: event.currency || 'USD',
              status: 'failed',
              paymentMethod: event.paymentMethod,
              failureReason: 'Card declined or insufficient funds',
              metadata: event.metadata,
            },
          },
          { upsert: true, new: true },
        );
      }

      await this.eventsService.emit({
        organizationId: orgId.toString(),
        subscriptionId: subscription?._id?.toString() || 'unknown',
        eventType: 'subscription.grace_period_started',
        previousStatus: 'active',
        currentStatus: 'past_due',
        planSlug: org.plan || 'starter',
        timestamp: new Date(),
      });
    }

    // 4. Subscription Cancelled / Deleted
    if (
      eventType === 'customer.subscription.deleted' ||
      eventType === 'subscription.cancelled'
    ) {
      if (subscription) {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        await subscription.save();
      }

      org.plan = 'free';
      await org.save();

      await this.eventsService.emit({
        organizationId: orgId.toString(),
        subscriptionId: subscription?._id?.toString() || 'unknown',
        eventType: 'subscription.cancelled',
        currentStatus: 'cancelled',
        planSlug: 'free',
        timestamp: new Date(),
      });
    }
  }

  private async resolveOrganization(event: BillingWebhookEvent): Promise<OrganizationDocument | null> {
    if (event.organizationId) {
      const org = await this.orgModel.findById(this.toObjectId(event.organizationId));
      if (org) return org;
    }

    if (event.subscriptionId) {
      const sub = await this.subscriptionModel.findOne({
        providerSubscriptionId: event.subscriptionId,
      });
      if (sub) {
        return this.orgModel.findById(sub.organizationId);
      }
    }

    if (event.customerId) {
      const sub = await this.subscriptionModel.findOne({
        providerCustomerId: event.customerId,
      });
      if (sub) {
        return this.orgModel.findById(sub.organizationId);
      }
    }

    return null;
  }

  async getOrganizationPayments(organizationId: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ organizationId: this.toObjectId(organizationId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async getOrganizationInvoices(organizationId: string): Promise<InvoiceDocument[]> {
    return this.invoiceModel
      .find({ organizationId: this.toObjectId(organizationId) })
      .sort({ issueDate: -1, createdAt: -1 })
      .limit(50)
      .exec();
  }
}
