"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const billing_controller_1 = require("./billing.controller");
const subscriptions_service_1 = require("./services/subscriptions.service");
const subscription_limit_service_1 = require("./services/subscription-limit.service");
const subscription_status_service_1 = require("./services/subscription-status.service");
const subscription_access_service_1 = require("./services/subscription-access.service");
const subscription_events_service_1 = require("./services/subscription-events.service");
const billing_webhook_service_1 = require("./services/billing-webhook.service");
const usage_service_1 = require("./services/usage.service");
const plan_schema_1 = require("./schemas/plan.schema");
const subscription_schema_1 = require("./schemas/subscription.schema");
const payment_schema_1 = require("./schemas/payment.schema");
const invoice_schema_1 = require("./schemas/invoice.schema");
const webhook_event_schema_1 = require("./schemas/webhook-event.schema");
const usage_record_schema_1 = require("./schemas/usage-record.schema");
const organization_schema_1 = require("../organizations/schemas/organization.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const organization_member_schema_1 = require("../organizations/schemas/organization-member.schema");
const workspace_schema_1 = require("../workspaces/schemas/workspace.schema");
const billing_module_1 = require("../../integrations/billing/billing.module");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: plan_schema_1.Plan.name, schema: plan_schema_1.PlanSchema },
                { name: subscription_schema_1.Subscription.name, schema: subscription_schema_1.SubscriptionSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: webhook_event_schema_1.WebhookEvent.name, schema: webhook_event_schema_1.WebhookEventSchema },
                { name: usage_record_schema_1.UsageRecord.name, schema: usage_record_schema_1.UsageRecordSchema },
                { name: organization_schema_1.Organization.name, schema: organization_schema_1.OrganizationSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: organization_member_schema_1.OrganizationMember.name, schema: organization_member_schema_1.OrganizationMemberSchema },
                { name: workspace_schema_1.Workspace.name, schema: workspace_schema_1.WorkspaceSchema },
            ]),
            billing_module_1.BillingModule,
        ],
        controllers: [billing_controller_1.BillingController],
        providers: [
            subscriptions_service_1.SubscriptionsService,
            subscription_limit_service_1.SubscriptionLimitService,
            subscription_status_service_1.SubscriptionStatusService,
            subscription_access_service_1.SubscriptionAccessService,
            subscription_events_service_1.SubscriptionEventsService,
            billing_webhook_service_1.BillingWebhookService,
            usage_service_1.UsageService,
        ],
        exports: [
            subscriptions_service_1.SubscriptionsService,
            subscription_limit_service_1.SubscriptionLimitService,
            subscription_status_service_1.SubscriptionStatusService,
            subscription_access_service_1.SubscriptionAccessService,
            subscription_events_service_1.SubscriptionEventsService,
            billing_webhook_service_1.BillingWebhookService,
            usage_service_1.UsageService,
            mongoose_1.MongooseModule,
        ],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map