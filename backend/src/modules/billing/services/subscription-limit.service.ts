import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { Plan, PlanDocument, PlanLimits } from '../schemas/plan.schema';
import { OrganizationMember, OrganizationMemberDocument } from '../../organizations/schemas/organization-member.schema';
import { Workspace, WorkspaceDocument } from '../../workspaces/schemas/workspace.schema';
import { DEFAULT_PLANS } from '../constants/default-plans';

@Injectable()
export class SubscriptionLimitService {
  private readonly logger = new Logger(SubscriptionLimitService.name);

  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    @InjectModel(OrganizationMember.name) private readonly memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async getPlanLimits(organizationId: string): Promise<{ plan: Partial<Plan>; limits: PlanLimits }> {
    const subscription = await this.subscriptionModel
      .findOne({ organizationId: this.toObjectId(organizationId), status: { $in: ['active', 'trialing'] } })
      .populate('planId')
      .exec();

    if (subscription && subscription.planId) {
      const plan = subscription.planId as any;
      return {
        plan: {
          name: plan.name,
          slug: plan.slug,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          currency: plan.currency,
        },
        limits: plan.limits,
      };
    }

    // Default to Free plan limits
    const freePlan = DEFAULT_PLANS.find((p) => p.slug === 'free') || DEFAULT_PLANS[0];
    return {
      plan: {
        name: freePlan.name,
        slug: freePlan.slug,
        monthlyPrice: freePlan.monthlyPrice,
        yearlyPrice: freePlan.yearlyPrice,
        currency: freePlan.currency,
      },
      limits: freePlan.limits,
    };
  }

  async checkLimit(
    organizationId: string,
    limitKey: keyof PlanLimits,
    currentUsage: number,
  ): Promise<{ allowed: boolean; limit: number; current: number; plan: string }> {
    const { plan, limits } = await this.getPlanLimits(organizationId);
    const maxAllowed = limits[limitKey];

    // Unlimited quota
    if (maxAllowed === -1) {
      return { allowed: true, limit: -1, current: currentUsage, plan: plan.name || 'Enterprise' };
    }

    if (currentUsage >= maxAllowed) {
      return { allowed: false, limit: maxAllowed, current: currentUsage, plan: plan.name || 'Free' };
    }

    return { allowed: true, limit: maxAllowed, current: currentUsage, plan: plan.name || 'Free' };
  }

  async canInviteMember(organizationId: string): Promise<boolean> {
    const memberCount = await this.memberModel.countDocuments({
      organizationId: this.toObjectId(organizationId),
      status: { $in: ['active', 'invited'] },
    });

    const check = await this.checkLimit(organizationId, 'maxUsers', memberCount);
    if (!check.allowed) {
      throw new ForbiddenException(
        `Team member limit reached (${check.current}/${check.limit}) for your ${check.plan} plan. Please upgrade your subscription to add more members.`,
      );
    }
    return true;
  }

  async canCreateWorkspace(organizationId: string): Promise<boolean> {
    const workspaceCount = await this.workspaceModel.countDocuments({
      organizationId: this.toObjectId(organizationId),
      isDeleted: false,
    });

    const check = await this.checkLimit(organizationId, 'maxWorkspaces', workspaceCount);
    if (!check.allowed) {
      throw new ForbiddenException(
        `Workspace limit reached (${check.current}/${check.limit}) for your ${check.plan} plan. Please upgrade your subscription to create additional workspaces.`,
      );
    }
    return true;
  }

  async canCreateWorkflow(organizationId: string, currentCount = 0): Promise<boolean> {
    const check = await this.checkLimit(organizationId, 'maxWorkflows', currentCount);
    if (!check.allowed) {
      throw new ForbiddenException(
        `Workflow limit reached (${check.current}/${check.limit}) for your ${check.plan} plan. Upgrade to create more workflows.`,
      );
    }
    return true;
  }

  async canCreateIntegration(organizationId: string, currentCount = 0): Promise<boolean> {
    const check = await this.checkLimit(organizationId, 'maxIntegrations', currentCount);
    if (!check.allowed) {
      throw new ForbiddenException(
        `Connected integration limit reached (${check.current}/${check.limit}) for your ${check.plan} plan.`,
      );
    }
    return true;
  }

  async canExecuteWorkflow(organizationId: string, currentMonthlyExecutions = 0): Promise<boolean> {
    const check = await this.checkLimit(organizationId, 'maxWorkflowExecutions', currentMonthlyExecutions);
    if (!check.allowed) {
      throw new ForbiddenException(
        `Monthly workflow execution quota exceeded (${check.current}/${check.limit}) for your ${check.plan} plan.`,
      );
    }
    return true;
  }

  async canUseAI(organizationId: string, tokensRequested = 1, currentTokensUsed = 0): Promise<boolean> {
    const check = await this.checkLimit(organizationId, 'maxAITokens', currentTokensUsed + tokensRequested);
    if (!check.allowed) {
      throw new ForbiddenException(
        `AI token usage quota exceeded for your ${check.plan} plan. Upgrade your plan for higher AI token limits.`,
      );
    }
    return true;
  }

  async getUsageOverview(organizationId: string) {
    const { plan, limits } = await this.getPlanLimits(organizationId);

    const [membersCount, workspacesCount] = await Promise.all([
      this.memberModel.countDocuments({
        organizationId: this.toObjectId(organizationId),
        status: 'active',
      }),
      this.workspaceModel.countDocuments({
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      }),
    ]);

    return {
      plan,
      usage: {
        users: { current: membersCount, limit: limits.maxUsers, percentage: limits.maxUsers === -1 ? 0 : Math.min(100, Math.round((membersCount / limits.maxUsers) * 100)) },
        workspaces: { current: workspacesCount, limit: limits.maxWorkspaces, percentage: limits.maxWorkspaces === -1 ? 0 : Math.min(100, Math.round((workspacesCount / limits.maxWorkspaces) * 100)) },
        workflows: { current: 0, limit: limits.maxWorkflows, percentage: 0 },
        executions: { current: 0, limit: limits.maxWorkflowExecutions, percentage: 0 },
        aiExecutions: { current: 0, limit: limits.maxAIExecutions, percentage: 0 },
        aiTokens: { current: 0, limit: limits.maxAITokens, percentage: 0 },
        storage: { current: 0, limit: limits.maxStorage, percentage: 0 },
      },
    };
  }
}
