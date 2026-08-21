import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionLimitService } from './services/subscription-limit.service';
import { BillingWebhookService } from './services/billing-webhook.service';
import { UsageService } from './services/usage.service';
import { CreateCheckoutDto, ChangePlanDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentUser, Public, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';

@ApiTags('Billing & Subscriptions')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly limitService: SubscriptionLimitService,
    private readonly webhookService: BillingWebhookService,
    private readonly usageService: UsageService,
  ) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List all public subscription plans and limits' })
  async getPlans() {
    return this.subscriptionsService.getPublicPlans();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('subscription')
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: 'Get current organization subscription details and usage stats' })
  async getSubscription(@CurrentOrganizationId() orgId: string) {
    return this.subscriptionsService.getOrganizationSubscription(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('usage')
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: 'Get current billing period usage metrics vs plan limits' })
  async getUsage(@CurrentOrganizationId() orgId: string) {
    return this.usageService.getUsageOverview(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('invoices')
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: 'Get all invoice history for current organization' })
  async getInvoices(@CurrentOrganizationId() orgId: string) {
    return this.webhookService.getOrganizationInvoices(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('payments')
  @RequirePermissions(Permission.BILLING_READ)
  @ApiOperation({ summary: 'Get all payment transaction records for current organization' })
  async getPayments(@CurrentOrganizationId() orgId: string) {
    return this.webhookService.getOrganizationPayments(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('checkout')
  @RequirePermissions(Permission.BILLING_MANAGE)
  @ApiOperation({ summary: 'Create a subscription checkout session with payment provider' })
  async createCheckout(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.subscriptionsService.createCheckout(orgId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('change-plan')
  @RequirePermissions(Permission.BILLING_MANAGE)
  @ApiOperation({ summary: 'Directly update or switch organization subscription plan' })
  async changePlan(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionsService.changePlan(orgId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('cancel')
  @RequirePermissions(Permission.BILLING_MANAGE)
  @ApiOperation({ summary: 'Schedule subscription cancellation at current period end' })
  async cancelSubscription(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.subscriptionsService.cancelSubscription(orgId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('reactivate')
  @RequirePermissions(Permission.BILLING_MANAGE)
  @ApiOperation({ summary: 'Reactivate and renew a cancelled subscription' })
  async reactivateSubscription(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.subscriptionsService.reactivateSubscription(orgId, userId);
  }

  @Public()
  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Handle incoming Stripe webhooks with cryptographic verification' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    const rawPayload = req.rawBody || JSON.stringify(body);
    return this.webhookService.handleWebhook('stripe', rawPayload, signature);
  }

  @Public()
  @Post('webhook/razorpay')
  @ApiOperation({ summary: 'Handle incoming Razorpay webhooks with HMAC verification' })
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    const rawPayload = req.rawBody || JSON.stringify(body);
    return this.webhookService.handleWebhook('razorpay', rawPayload, signature);
  }
}
