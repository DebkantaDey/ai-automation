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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscriptions_service_1 = require("./services/subscriptions.service");
const subscription_limit_service_1 = require("./services/subscription-limit.service");
const billing_webhook_service_1 = require("./services/billing-webhook.service");
const usage_service_1 = require("./services/usage.service");
const create_checkout_dto_1 = require("./dto/create-checkout.dto");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../core/auth/guards/permissions.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
const permissions_decorator_1 = require("../../core/auth/decorators/permissions.decorator");
const permission_enum_1 = require("../../core/common/enums/permission.enum");
let BillingController = class BillingController {
    subscriptionsService;
    limitService;
    webhookService;
    usageService;
    constructor(subscriptionsService, limitService, webhookService, usageService) {
        this.subscriptionsService = subscriptionsService;
        this.limitService = limitService;
        this.webhookService = webhookService;
        this.usageService = usageService;
    }
    async getPlans() {
        return this.subscriptionsService.getPublicPlans();
    }
    async getSubscription(orgId) {
        return this.subscriptionsService.getOrganizationSubscription(orgId);
    }
    async getUsage(orgId) {
        return this.usageService.getUsageOverview(orgId);
    }
    async getInvoices(orgId) {
        return this.webhookService.getOrganizationInvoices(orgId);
    }
    async getPayments(orgId) {
        return this.webhookService.getOrganizationPayments(orgId);
    }
    async createCheckout(orgId, userId, dto) {
        return this.subscriptionsService.createCheckout(orgId, userId, dto);
    }
    async changePlan(orgId, userId, dto) {
        return this.subscriptionsService.changePlan(orgId, userId, dto);
    }
    async cancelSubscription(orgId, userId) {
        return this.subscriptionsService.cancelSubscription(orgId, userId);
    }
    async reactivateSubscription(orgId, userId) {
        return this.subscriptionsService.reactivateSubscription(orgId, userId);
    }
    async handleStripeWebhook(signature, req, body) {
        const rawPayload = req.rawBody || JSON.stringify(body);
        return this.webhookService.handleWebhook('stripe', rawPayload, signature);
    }
    async handleRazorpayWebhook(signature, req, body) {
        const rawPayload = req.rawBody || JSON.stringify(body);
        return this.webhookService.handleWebhook('razorpay', rawPayload, signature);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List all public subscription plans and limits' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPlans", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('subscription'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get current organization subscription details and usage stats' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getSubscription", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('usage'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get current billing period usage metrics vs plan limits' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getUsage", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('invoices'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invoice history for current organization' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoices", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Get)('payments'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payment transaction records for current organization' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPayments", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('checkout'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a subscription checkout session with payment provider' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_checkout_dto_1.CreateCheckoutDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createCheckout", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('change-plan'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Directly update or switch organization subscription plan' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_checkout_dto_1.ChangePlanDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "changePlan", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('cancel'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule subscription cancellation at current period end' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancelSubscription", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Post)('reactivate'),
    (0, permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.BILLING_MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate and renew a cancelled subscription' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __param(1, (0, tenant_decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "reactivateSubscription", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('webhook/stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle incoming Stripe webhooks with cryptographic verification' }),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, tenant_decorators_1.Public)(),
    (0, common_1.Post)('webhook/razorpay'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle incoming Razorpay webhooks with HMAC verification' }),
    __param(0, (0, common_1.Headers)('x-razorpay-signature')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "handleRazorpayWebhook", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing & Subscriptions'),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService,
        subscription_limit_service_1.SubscriptionLimitService,
        billing_webhook_service_1.BillingWebhookService,
        usage_service_1.UsageService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map