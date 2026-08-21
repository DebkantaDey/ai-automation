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
var StripeBillingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeBillingProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeBillingProvider = StripeBillingProvider_1 = class StripeBillingProvider {
    configService;
    providerName = 'stripe';
    stripe = null;
    logger = new common_1.Logger(StripeBillingProvider_1.name);
    constructor(configService) {
        this.configService = configService;
        const config = this.configService.get('billing');
        if (config?.stripeSecretKey) {
            this.stripe = new stripe_1.default(config.stripeSecretKey, {
                apiVersion: '2024-12-18.acacia',
            });
        }
    }
    ensureClient() {
        if (!this.stripe) {
            const apiKey = this.configService.get('billing.stripeSecretKey') || process.env.STRIPE_SECRET_KEY;
            if (!apiKey) {
                throw new Error('Stripe API Key is not configured');
            }
            this.stripe = new stripe_1.default(apiKey, {
                apiVersion: '2024-12-18.acacia',
            });
        }
        return this.stripe;
    }
    async createCustomer(email, name, metadata = {}) {
        const client = this.ensureClient();
        const customer = await client.customers.create({
            email,
            name,
            metadata,
        });
        return customer.id;
    }
    async createCheckoutSession(customerId, priceId, successUrl, cancelUrl, metadata = {}) {
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
    async getSubscription(subscriptionId) {
        const client = this.ensureClient();
        const sub = await client.subscriptions.retrieve(subscriptionId);
        return {
            id: sub.id,
            customerId: sub.customer,
            status: sub.status,
            planId: sub.items.data[0]?.price.id || '',
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
    }
    async cancelSubscription(subscriptionId) {
        const client = this.ensureClient();
        const sub = await client.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
        return {
            id: sub.id,
            customerId: sub.customer,
            status: sub.status,
            planId: sub.items.data[0]?.price.id || '',
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
    }
    async reactivateSubscription(subscriptionId) {
        const client = this.ensureClient();
        const sub = await client.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
        return {
            id: sub.id,
            customerId: sub.customer,
            status: sub.status,
            planId: sub.items.data[0]?.price.id || '',
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: false,
        };
    }
    async verifyWebhookSignature(payload, signature) {
        const client = this.ensureClient();
        const webhookSecret = this.configService.get('billing.stripeWebhookSecret') ||
            process.env.STRIPE_WEBHOOK_SECRET ||
            '';
        let event;
        try {
            event = client.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error(`Stripe webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Invalid Stripe webhook signature: ${err.message}`);
        }
        const eventType = event.type;
        let customerId;
        let subscriptionId;
        let organizationId;
        let status;
        let planId;
        let amount;
        let currency;
        let invoiceId;
        let paymentId;
        let invoiceUrl;
        let invoicePdf;
        let receiptUrl;
        let paymentMethod;
        let paymentMethodDetails;
        const dataObj = event.data.object;
        if (event.type.startsWith('customer.subscription.')) {
            subscriptionId = dataObj.id;
            customerId = dataObj.customer;
            status = dataObj.status;
            planId = dataObj.items?.data?.[0]?.price?.id;
            organizationId = dataObj.metadata?.organizationId || dataObj.metadata?.orgId;
        }
        else if (event.type.startsWith('invoice.')) {
            invoiceId = dataObj.id;
            customerId = dataObj.customer;
            subscriptionId = dataObj.subscription;
            status = dataObj.status;
            amount = dataObj.amount_paid ? dataObj.amount_paid / 100 : (dataObj.total ? dataObj.total / 100 : 0);
            currency = (dataObj.currency || 'usd').toUpperCase();
            invoiceUrl = dataObj.hosted_invoice_url;
            invoicePdf = dataObj.invoice_pdf;
            paymentId = dataObj.payment_intent;
            organizationId =
                dataObj.subscription_details?.metadata?.organizationId ||
                    dataObj.metadata?.organizationId ||
                    dataObj.metadata?.orgId;
        }
        else if (event.type === 'checkout.session.completed') {
            customerId = dataObj.customer;
            subscriptionId = dataObj.subscription;
            organizationId = dataObj.metadata?.organizationId || dataObj.metadata?.orgId;
            amount = dataObj.amount_total ? dataObj.amount_total / 100 : 0;
            currency = (dataObj.currency || 'usd').toUpperCase();
        }
        else if (event.type.startsWith('payment_intent.')) {
            paymentId = dataObj.id;
            customerId = dataObj.customer;
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
};
exports.StripeBillingProvider = StripeBillingProvider;
exports.StripeBillingProvider = StripeBillingProvider = StripeBillingProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeBillingProvider);
//# sourceMappingURL=stripe.provider.js.map