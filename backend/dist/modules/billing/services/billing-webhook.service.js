"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BillingWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingWebhookService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const webhook_event_schema_1 = require("../schemas/webhook-event.schema");
const payment_schema_1 = require("../schemas/payment.schema");
const invoice_schema_1 = require("../schemas/invoice.schema");
const subscription_schema_1 = require("../schemas/subscription.schema");
const plan_schema_1 = require("../schemas/plan.schema");
const organization_schema_1 = require("../../organizations/schemas/organization.schema");
const billing_service_1 = require("../../../integrations/billing/billing.service");
const subscription_events_service_1 = require("./subscription-events.service");
const subscription_status_service_1 = require("./subscription-status.service");
let BillingWebhookService = BillingWebhookService_1 = class BillingWebhookService {
    webhookEventModel;
    paymentModel;
    invoiceModel;
    subscriptionModel;
    planModel;
    orgModel;
    billingService;
    eventsService;
    statusService;
    logger = new common_1.Logger(BillingWebhookService_1.name);
    constructor(webhookEventModel, paymentModel, invoiceModel, subscriptionModel, planModel, orgModel, billingService, eventsService, statusService) {
        this.webhookEventModel = webhookEventModel;
        this.paymentModel = paymentModel;
        this.invoiceModel = invoiceModel;
        this.subscriptionModel = subscriptionModel;
        this.planModel = planModel;
        this.orgModel = orgModel;
        this.billingService = billingService;
        this.eventsService = eventsService;
        this.statusService = statusService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async handleWebhook(provider, payload, signature) {
        if (!signature) {
            throw new common_1.BadRequestException(`Missing ${provider} webhook signature header`);
        }
        const providerClient = this.billingService.getProvider(provider);
        const event = await providerClient.verifyWebhookSignature(payload, signature);
        const existing = await this.webhookEventModel.findOne({
            provider,
            providerEventId: event.eventId,
        });
        if (existing && existing.status === 'processed') {
            this.logger.warn(`Duplicate webhook event ignored: [${provider}:${event.eventId}]`);
            return { received: true, status: 'already_processed', eventId: event.eventId };
        }
        const webhookRecord = existing ||
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
        }
        catch (err) {
            this.logger.error(`Failed to process webhook event [${event.eventId}]: ${err.message}`, err.stack);
            webhookRecord.status = 'failed';
            webhookRecord.error = err.message;
            await webhookRecord.save();
            throw err;
        }
    }
    async processEvent(event) {
        const org = await this.resolveOrganization(event);
        if (!org) {
            this.logger.warn(`Unable to resolve organization for webhook event [${event.provider}:${event.eventType}] (Sub: ${event.subscriptionId}, Cust: ${event.customerId})`);
            return;
        }
        const orgId = org._id;
        let subscription = await this.subscriptionModel.findOne({
            $or: [
                { organizationId: orgId },
                { providerSubscriptionId: event.subscriptionId },
                { providerCustomerId: event.customerId },
            ],
        });
        const eventType = event.eventType.toLowerCase();
        if (eventType === 'checkout.session.completed' ||
            eventType === 'customer.subscription.created' ||
            eventType === 'subscription.authenticated') {
            let targetPlan = null;
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
                if (targetPlan)
                    subscription.planId = targetPlan._id;
                subscription.status = 'active';
                subscription.provider = event.provider;
                if (event.subscriptionId)
                    subscription.providerSubscriptionId = event.subscriptionId;
                if (event.customerId)
                    subscription.providerCustomerId = event.customerId;
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
        if (eventType === 'invoice.paid' ||
            eventType === 'invoice.payment_succeeded' ||
            eventType === 'subscription.charged' ||
            eventType === 'payment_intent.succeeded') {
            if (subscription) {
                subscription.status = 'active';
                subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000);
                await subscription.save();
            }
            if (event.paymentId || event.amount) {
                const paymentId = event.paymentId || `pay_${event.eventId}`;
                const paymentRecord = await this.paymentModel.findOneAndUpdate({ provider: event.provider, providerPaymentId: paymentId }, {
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
                }, { upsert: true, new: true });
            }
            if (event.invoiceId) {
                await this.invoiceModel.findOneAndUpdate({ provider: event.provider, providerInvoiceId: event.invoiceId }, {
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
                }, { upsert: true, new: true });
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
        if (eventType === 'invoice.payment_failed' ||
            eventType === 'payment_intent.payment_failed' ||
            eventType === 'subscription.pending') {
            if (subscription) {
                this.statusService.validateTransition(subscription.status, 'past_due');
                subscription.status = 'past_due';
                await subscription.save();
            }
            if (event.paymentId || event.amount) {
                const paymentId = event.paymentId || `pay_failed_${event.eventId}`;
                await this.paymentModel.findOneAndUpdate({ provider: event.provider, providerPaymentId: paymentId }, {
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
                }, { upsert: true, new: true });
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
        if (eventType === 'customer.subscription.deleted' ||
            eventType === 'subscription.cancelled') {
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
    async resolveOrganization(event) {
        if (event.organizationId) {
            const org = await this.orgModel.findById(this.toObjectId(event.organizationId));
            if (org)
                return org;
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
    async getOrganizationPayments(organizationId) {
        return this.paymentModel
            .find({ organizationId: this.toObjectId(organizationId) })
            .sort({ createdAt: -1 })
            .limit(50)
            .exec();
    }
    async getOrganizationInvoices(organizationId) {
        return this.invoiceModel
            .find({ organizationId: this.toObjectId(organizationId) })
            .sort({ issueDate: -1, createdAt: -1 })
            .limit(50)
            .exec();
    }
};
exports.BillingWebhookService = BillingWebhookService;
exports.BillingWebhookService = BillingWebhookService = BillingWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(webhook_event_schema_1.WebhookEvent.name)),
    __param(1, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(2, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(3, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __param(4, (0, mongoose_1.InjectModel)(plan_schema_1.Plan.name)),
    __param(5, (0, mongoose_1.InjectModel)(organization_schema_1.Organization.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        billing_service_1.BillingService,
        subscription_events_service_1.SubscriptionEventsService,
        subscription_status_service_1.SubscriptionStatusService])
], BillingWebhookService);
//# sourceMappingURL=billing-webhook.service.js.map