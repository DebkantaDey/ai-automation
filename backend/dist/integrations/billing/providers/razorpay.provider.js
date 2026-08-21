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
var RazorpayBillingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayBillingProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const Razorpay = require('razorpay');
let RazorpayBillingProvider = RazorpayBillingProvider_1 = class RazorpayBillingProvider {
    configService;
    providerName = 'razorpay';
    razorpay = null;
    logger = new common_1.Logger(RazorpayBillingProvider_1.name);
    constructor(configService) {
        this.configService = configService;
        const config = this.configService.get('billing');
        if (config?.razorpayKeyId && config?.razorpayKeySecret) {
            this.razorpay = new Razorpay({
                key_id: config.razorpayKeyId,
                key_secret: config.razorpayKeySecret,
            });
        }
    }
    ensureClient() {
        if (!this.razorpay) {
            const key_id = this.configService.get('billing.razorpayKeyId') || process.env.RAZORPAY_KEY_ID;
            const key_secret = this.configService.get('billing.razorpayKeySecret') || process.env.RAZORPAY_KEY_SECRET;
            if (!key_id || !key_secret) {
                throw new Error('Razorpay API keys are not configured');
            }
            this.razorpay = new Razorpay({ key_id, key_secret });
        }
        return this.razorpay;
    }
    async createCustomer(email, name, metadata = {}) {
        const client = this.ensureClient();
        const customer = await client.customers.create({
            name,
            email,
            notes: metadata,
        });
        return customer.id;
    }
    async createCheckoutSession(customerId, priceId, successUrl, cancelUrl, metadata = {}) {
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
    async getSubscription(subscriptionId) {
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
    async cancelSubscription(subscriptionId) {
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
    async reactivateSubscription(subscriptionId) {
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
    async verifyWebhookSignature(payload, signature) {
        const secret = this.configService.get('billing.razorpayWebhookSecret') ||
            process.env.RAZORPAY_WEBHOOK_SECRET ||
            '';
        const body = typeof payload === 'string' ? payload : payload.toString('utf8');
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');
        if (expectedSignature !== signature) {
            this.logger.error('Razorpay webhook HMAC signature mismatch');
            throw new common_1.BadRequestException('Invalid Razorpay webhook signature');
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
        let paymentMethodDetails;
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
};
exports.RazorpayBillingProvider = RazorpayBillingProvider;
exports.RazorpayBillingProvider = RazorpayBillingProvider = RazorpayBillingProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayBillingProvider);
//# sourceMappingURL=razorpay.provider.js.map