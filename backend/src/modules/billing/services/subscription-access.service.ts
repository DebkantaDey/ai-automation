import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { SubscriptionStatusService } from './subscription-status.service';
import { SubscriptionLimitService } from './subscription-limit.service';

@Injectable()
export class SubscriptionAccessService {
  private readonly logger = new Logger(SubscriptionAccessService.name);

  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly statusService: SubscriptionStatusService,
    private readonly limitService: SubscriptionLimitService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async checkMutationAccess(organizationId: string): Promise<boolean> {
    const sub = await this.subscriptionModel.findOne({
      organizationId: this.toObjectId(organizationId),
    });

    if (!sub) {
      return true; // Will fall back to Free plan
    }

    const computed = this.statusService.getSubscriptionStatus(sub);

    if (!computed.canPerformMutations) {
      if (computed.isTrialExpired) {
        throw new ForbiddenException(
          'Subscription Required: Your free trial has expired. Please upgrade your subscription to continue creating and executing automations.',
        );
      }

      if (computed.state === 'past_due_restricted') {
        throw new ForbiddenException(
          'Payment Required: Your subscription is past due and the grace period has ended. Please update your payment method to resume operations.',
        );
      }

      if (computed.state === 'cancelled') {
        throw new ForbiddenException(
          'Subscription Cancelled: Please reactivate your subscription to resume automated operations.',
        );
      }

      throw new ForbiddenException(
        'Subscription Inactive: Please renew your subscription to access this feature.',
      );
    }

    return true;
  }

  async canCreateWorkflow(organizationId: string, currentCount = 0): Promise<boolean> {
    await this.checkMutationAccess(organizationId);
    return this.limitService.canCreateWorkflow(organizationId, currentCount);
  }

  async canExecuteWorkflow(organizationId: string, currentCount = 0): Promise<boolean> {
    await this.checkMutationAccess(organizationId);
    return this.limitService.canExecuteWorkflow(organizationId, currentCount);
  }

  async canUseAI(organizationId: string, tokensRequested = 1, currentTokens = 0): Promise<boolean> {
    await this.checkMutationAccess(organizationId);
    return this.limitService.canUseAI(organizationId, tokensRequested, currentTokens);
  }

  async canConnectIntegration(organizationId: string, currentCount = 0): Promise<boolean> {
    await this.checkMutationAccess(organizationId);
    return this.limitService.canCreateIntegration(organizationId, currentCount);
  }

  async canInviteMembers(organizationId: string): Promise<boolean> {
    await this.checkMutationAccess(organizationId);
    return this.limitService.canInviteMember(organizationId);
  }

  async canCreateWorkspace(organizationId: string): Promise<boolean> {
    await this.checkMutationAccess(organizationId);
    return this.limitService.canCreateWorkspace(organizationId);
  }
}
