export type SubscriptionEventType = 'subscription.created' | 'subscription.updated' | 'subscription.trial_started' | 'subscription.trial_expiring_soon' | 'subscription.trial_expired' | 'subscription.grace_period_started' | 'subscription.status_changed' | 'subscription.renewed' | 'subscription.cancelled' | 'subscription.plan_changed' | 'payment.succeeded' | 'payment.failed' | 'invoice.created' | 'invoice.paid' | 'invoice.failed';
export interface SubscriptionEventPayload {
    organizationId: string;
    subscriptionId: string;
    eventType: SubscriptionEventType;
    previousStatus?: string;
    currentStatus: string;
    planSlug: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export declare class SubscriptionEventsService {
    private readonly logger;
    emit(payload: SubscriptionEventPayload): Promise<void>;
}
