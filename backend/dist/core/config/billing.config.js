"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('billing', () => ({
    defaultProvider: process.env.BILLING_DEFAULT_PROVIDER || 'stripe',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    trialEnabled: process.env.TRIAL_ENABLED !== 'false',
    trialDurationDays: parseInt(process.env.TRIAL_DURATION_DAYS || '7', 10),
    trialPlan: process.env.TRIAL_PLAN || 'starter',
    gracePeriodDays: parseInt(process.env.GRACE_PERIOD_DAYS || '3', 10),
}));
//# sourceMappingURL=billing.config.js.map