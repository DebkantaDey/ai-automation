import { Model } from 'mongoose';
import { WebhookEventDocument } from '../schemas/webhook-event.schema';
import { PaymentDocument } from '../schemas/payment.schema';
import { InvoiceDocument } from '../schemas/invoice.schema';
import { SubscriptionDocument } from '../schemas/subscription.schema';
import { PlanDocument } from '../schemas/plan.schema';
import { OrganizationDocument } from '../../organizations/schemas/organization.schema';
import { BillingService } from '../../../integrations/billing/billing.service';
import { SubscriptionEventsService } from './subscription-events.service';
import { SubscriptionStatusService } from './subscription-status.service';
export declare class BillingWebhookService {
    private readonly webhookEventModel;
    private readonly paymentModel;
    private readonly invoiceModel;
    private readonly subscriptionModel;
    private readonly planModel;
    private readonly orgModel;
    private readonly billingService;
    private readonly eventsService;
    private readonly statusService;
    private readonly logger;
    constructor(webhookEventModel: Model<WebhookEventDocument>, paymentModel: Model<PaymentDocument>, invoiceModel: Model<InvoiceDocument>, subscriptionModel: Model<SubscriptionDocument>, planModel: Model<PlanDocument>, orgModel: Model<OrganizationDocument>, billingService: BillingService, eventsService: SubscriptionEventsService, statusService: SubscriptionStatusService);
    private toObjectId;
    handleWebhook(provider: 'stripe' | 'razorpay', payload: string | Buffer, signature: string): Promise<{
        received: boolean;
        status: string;
        eventId?: string;
    }>;
    private processEvent;
    private resolveOrganization;
    getOrganizationPayments(organizationId: string): Promise<PaymentDocument[]>;
    getOrganizationInvoices(organizationId: string): Promise<InvoiceDocument[]>;
}
