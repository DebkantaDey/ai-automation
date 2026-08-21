export declare class CreateCheckoutDto {
    planSlug: string;
    billingInterval: 'monthly' | 'yearly';
    provider?: 'stripe' | 'razorpay';
    successUrl?: string;
    cancelUrl?: string;
}
export declare class ChangePlanDto {
    planSlug: string;
    billingInterval: 'monthly' | 'yearly';
}
