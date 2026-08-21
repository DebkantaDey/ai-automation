import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionLimitService } from './services/subscription-limit.service';
import { SubscriptionStatusService } from './services/subscription-status.service';
import { SubscriptionAccessService } from './services/subscription-access.service';
import { SubscriptionEventsService } from './services/subscription-events.service';
import { BillingWebhookService } from './services/billing-webhook.service';
import { UsageService } from './services/usage.service';
import { Plan, PlanSchema } from './schemas/plan.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { WebhookEvent, WebhookEventSchema } from './schemas/webhook-event.schema';
import { UsageRecord, UsageRecordSchema } from './schemas/usage-record.schema';
import { Organization, OrganizationSchema } from '../organizations/schemas/organization.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { OrganizationMember, OrganizationMemberSchema } from '../organizations/schemas/organization-member.schema';
import { Workspace, WorkspaceSchema } from '../workspaces/schemas/workspace.schema';
import { BillingModule as BillingIntegrationModule } from '../../integrations/billing/billing.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
      { name: UsageRecord.name, schema: UsageRecordSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
    BillingIntegrationModule,
  ],
  controllers: [BillingController],
  providers: [
    SubscriptionsService,
    SubscriptionLimitService,
    SubscriptionStatusService,
    SubscriptionAccessService,
    SubscriptionEventsService,
    BillingWebhookService,
    UsageService,
  ],
  exports: [
    SubscriptionsService,
    SubscriptionLimitService,
    SubscriptionStatusService,
    SubscriptionAccessService,
    SubscriptionEventsService,
    BillingWebhookService,
    UsageService,
    MongooseModule,
  ],
})
export class BillingModule {}
