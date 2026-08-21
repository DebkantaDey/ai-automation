import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { Organization, OrganizationDocument } from '../../organizations/schemas/organization.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { BillingService } from '../../../integrations/billing/billing.service';
import { SubscriptionLimitService } from './subscription-limit.service';
import { SubscriptionStatusService } from './subscription-status.service';
import { SubscriptionEventsService } from './subscription-events.service';
import { CreateCheckoutDto, ChangePlanDto } from '../dto/create-checkout.dto';
import { DEFAULT_PLANS } from '../constants/default-plans';
import { BillingConfig } from '../../../core/config/billing.config';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly billingService: BillingService,
    private readonly limitService: SubscriptionLimitService,
    private readonly statusService: SubscriptionStatusService,
    private readonly eventsService: SubscriptionEventsService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async onModuleInit() {
    await this.ensureDefaultPlans();
  }

  async ensureDefaultPlans(): Promise<void> {
    for (const planDef of DEFAULT_PLANS) {
      const existing = await this.planModel.findOne({ slug: planDef.slug });
      if (!existing) {
        const plan = new this.planModel({
          ...planDef,
          isActive: true,
          isPublic: true,
        });
        await plan.save();
        this.logger.log(`Initialized default billing plan: [${planDef.name}]`);
      }
    }
  }

  async getPublicPlans(): Promise<PlanDocument[]> {
    return this.planModel
      .find({ isActive: true, isPublic: true })
      .sort({ monthlyPrice: 1 })
      .exec();
  }

  async getPlanBySlug(slug: string): Promise<PlanDocument> {
    const plan = await this.planModel.findOne({ slug: slug.toLowerCase() });
    if (!plan) {
      throw new NotFoundException(`Plan with slug '${slug}' not found`);
    }
    return plan;
  }

  async ensureTrialSubscription(
    organizationId: string,
    userId?: string,
  ): Promise<SubscriptionDocument> {
    const existing = await this.subscriptionModel
      .findOne({ organizationId: this.toObjectId(organizationId) })
      .populate('planId')
      .exec();

    if (existing) {
      return existing;
    }

    const billingConfig = this.configService.get<BillingConfig>('billing');
    const trialEnabled = billingConfig?.trialEnabled ?? true;
    const trialDays = billingConfig?.trialDurationDays ?? 7;
    const trialPlanSlug = billingConfig?.trialPlan ?? 'starter';

    const now = new Date();

    if (trialEnabled) {
      const trialPlan = await this.getPlanBySlug(trialPlanSlug);
      const trialEnd = new Date(now.getTime() + trialDays * 24 * 3600 * 1000);

      const sub = new this.subscriptionModel({
        organizationId: this.toObjectId(organizationId),
        planId: trialPlan._id,
        provider: 'manual',
        status: 'trialing',
        billingInterval: 'monthly',
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        cancelAtPeriodEnd: false,
      });
      await sub.save();

      await this.eventsService.emit({
        organizationId: organizationId.toString(),
        subscriptionId: sub._id.toString(),
        eventType: 'subscription.trial_started',
        currentStatus: 'trialing',
        planSlug: trialPlan.slug,
        timestamp: now,
        metadata: { trialDurationDays: trialDays, trialEnd },
      });

      return (await this.subscriptionModel.findById(sub._id).populate('planId').exec()) as SubscriptionDocument;
    }

    // Default to standard Free plan
    const freePlan = await this.getPlanBySlug('free');
    const sub = new this.subscriptionModel({
      organizationId: this.toObjectId(organizationId),
      planId: freePlan._id,
      provider: 'manual',
      status: 'active',
      billingInterval: 'monthly',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 3600 * 1000),
      cancelAtPeriodEnd: false,
    });
    await sub.save();

    return (await this.subscriptionModel.findById(sub._id).populate('planId').exec()) as SubscriptionDocument;
  }

  async getOrganizationSubscription(organizationId: string) {
    let sub: any = await this.subscriptionModel
      .findOne({ organizationId: this.toObjectId(organizationId) })
      .populate('planId')
      .exec();

    if (!sub) {
      sub = await this.ensureTrialSubscription(organizationId);
    }

    const computedStatus = this.statusService.getSubscriptionStatus(sub);
    const usageOverview = await this.limitService.getUsageOverview(organizationId);

    return {
      subscription: {
        id: sub?._id,
        organizationId: sub?.organizationId,
        status: sub?.status,
        provider: sub?.provider,
        billingInterval: sub?.billingInterval,
        currentPeriodStart: sub?.currentPeriodStart,
        currentPeriodEnd: sub?.currentPeriodEnd,
        trialStart: sub?.trialStart,
        trialEnd: sub?.trialEnd,
        cancelAtPeriodEnd: sub?.cancelAtPeriodEnd,
        cancelledAt: sub?.cancelledAt,
        plan: sub?.planId,
      },
      statusDetails: computedStatus,
      usage: usageOverview.usage,
    };
  }

  async createCheckout(organizationId: string, userId: string, dto: CreateCheckoutDto) {
    const targetPlan = await this.getPlanBySlug(dto.planSlug);
    const org = await this.orgModel.findById(this.toObjectId(organizationId));
    const user = await this.userModel.findById(this.toObjectId(userId));

    if (!org || !user) {
      throw new NotFoundException('Organization or user not found');
    }

    if (targetPlan.slug === 'free' || targetPlan.monthlyPrice === 0) {
      return this.changePlan(organizationId, userId, {
        planSlug: 'free',
        billingInterval: dto.billingInterval,
      });
    }

    const providerName = dto.provider || 'stripe';
    const priceId =
      dto.billingInterval === 'yearly'
        ? targetPlan.providerReferences?.[providerName]?.yearlyPriceId || `price_${targetPlan.slug}_yearly`
        : targetPlan.providerReferences?.[providerName]?.monthlyPriceId || `price_${targetPlan.slug}_monthly`;

    const successUrl =
      dto.successUrl || `http://localhost:3000/${org.slug}/default/settings/billing?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      dto.cancelUrl || `http://localhost:3000/${org.slug}/default/settings/billing?cancelled=true`;

    const checkout = await this.billingService.createSubscriptionCheckout(
      `cust_${org._id}`,
      priceId,
      successUrl,
      cancelUrl,
      providerName,
    );

    return {
      sessionId: checkout.sessionId,
      checkoutUrl: checkout.url,
      plan: targetPlan.name,
      interval: dto.billingInterval,
      provider: providerName,
    };
  }

  async changePlan(organizationId: string, userId: string, dto: ChangePlanDto) {
    const targetPlan = await this.getPlanBySlug(dto.planSlug);
    const org = await this.orgModel.findById(this.toObjectId(organizationId));
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const sub = await this.subscriptionModel.findOne({ organizationId: this.toObjectId(organizationId) });
    const currentStatus = sub?.status || 'trialing';

    this.statusService.validateTransition(currentStatus, 'active');

    const currentPeriodEnd = new Date(
      Date.now() + (dto.billingInterval === 'yearly' ? 365 : 30) * 24 * 3600 * 1000,
    );

    const updatedSub = await this.subscriptionModel.findOneAndUpdate(
      { organizationId: this.toObjectId(organizationId) },
      {
        $set: {
          planId: targetPlan._id,
          billingInterval: dto.billingInterval,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd,
          cancelAtPeriodEnd: false,
          cancelledAt: null,
        },
      },
      { upsert: true, new: true },
    ).populate('planId');

    org.plan = targetPlan.slug;
    await org.save();

    await this.eventsService.emit({
      organizationId: organizationId.toString(),
      subscriptionId: updatedSub._id.toString(),
      eventType: 'subscription.plan_changed',
      previousStatus: currentStatus,
      currentStatus: 'active',
      planSlug: targetPlan.slug,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: `Organization subscription updated to ${targetPlan.name} (${dto.billingInterval})`,
      subscription: updatedSub,
    };
  }

  async cancelSubscription(organizationId: string, userId: string) {
    const sub = await this.subscriptionModel.findOne({
      organizationId: this.toObjectId(organizationId),
    });

    if (!sub) {
      throw new NotFoundException('No active subscription found');
    }

    this.statusService.validateTransition(sub.status, 'cancelled');

    sub.cancelAtPeriodEnd = true;
    sub.cancelledAt = new Date();
    await sub.save();

    await this.eventsService.emit({
      organizationId: organizationId.toString(),
      subscriptionId: sub._id.toString(),
      eventType: 'subscription.cancelled',
      currentStatus: sub.status,
      planSlug: 'active',
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Subscription scheduled for cancellation at the end of the current billing period',
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }

  async reactivateSubscription(organizationId: string, userId: string) {
    const sub = await this.subscriptionModel.findOne({
      organizationId: this.toObjectId(organizationId),
    });

    if (!sub) {
      throw new NotFoundException('No active subscription found');
    }

    this.statusService.validateTransition(sub.status, 'active');

    sub.cancelAtPeriodEnd = false;
    sub.cancelledAt = undefined;
    await sub.save();

    await this.eventsService.emit({
      organizationId: organizationId.toString(),
      subscriptionId: sub._id.toString(),
      eventType: 'subscription.renewed',
      currentStatus: sub.status,
      planSlug: 'active',
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Subscription successfully reactivated and renewed',
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }
}
