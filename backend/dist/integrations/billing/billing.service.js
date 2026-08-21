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
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_provider_1 = require("./providers/stripe.provider");
const razorpay_provider_1 = require("./providers/razorpay.provider");
let BillingService = BillingService_1 = class BillingService {
    configService;
    stripeProvider;
    razorpayProvider;
    logger = new common_1.Logger(BillingService_1.name);
    providers = new Map();
    defaultProviderName;
    constructor(configService, stripeProvider, razorpayProvider) {
        this.configService = configService;
        this.stripeProvider = stripeProvider;
        this.razorpayProvider = razorpayProvider;
        this.providers.set('stripe', this.stripeProvider);
        this.providers.set('razorpay', this.razorpayProvider);
        const config = this.configService.get('billing');
        this.defaultProviderName = config?.defaultProvider || 'stripe';
    }
    getProvider(name) {
        const key = (name || this.defaultProviderName).toLowerCase();
        const provider = this.providers.get(key);
        if (!provider) {
            throw new common_1.NotFoundException(`Billing Provider '${key}' is not registered`);
        }
        return provider;
    }
    async createCustomer(email, name, orgId, providerName) {
        const provider = this.getProvider(providerName);
        const customerId = await provider.createCustomer(email, name, { organizationId: orgId });
        return { customerId, provider: provider.providerName };
    }
    async createSubscriptionCheckout(customerId, priceId, successUrl, cancelUrl, providerName) {
        const provider = this.getProvider(providerName);
        return provider.createCheckoutSession(customerId, priceId, successUrl, cancelUrl);
    }
    async getSubscription(subscriptionId, providerName) {
        const provider = this.getProvider(providerName);
        return provider.getSubscription(subscriptionId);
    }
    async cancelSubscription(subscriptionId, providerName) {
        const provider = this.getProvider(providerName);
        return provider.cancelSubscription(subscriptionId);
    }
    async handleWebhook(providerName, payload, signature) {
        const provider = this.getProvider(providerName);
        return provider.verifyWebhookSignature(payload, signature);
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        stripe_provider_1.StripeBillingProvider,
        razorpay_provider_1.RazorpayBillingProvider])
], BillingService);
//# sourceMappingURL=billing.service.js.map