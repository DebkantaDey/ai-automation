export interface BillingConfig {
    defaultProvider: 'stripe' | 'razorpay';
    stripeSecretKey?: string;
    stripeWebhookSecret?: string;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    razorpayWebhookSecret?: string;
    trialEnabled: boolean;
    trialDurationDays: number;
    trialPlan: string;
    gracePeriodDays: number;
}
declare const _default: (() => BillingConfig) & import("@nestjs/config").ConfigFactoryKeyHost<BillingConfig>;
export default _default;
