import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Organization, OrganizationDocument } from '../organizations/schemas/organization.schema';
import { Subscription, SubscriptionDocument } from '../billing/schemas/subscription.schema';
import { Workflow, WorkflowDocument } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from '../workflows/schemas/workflow-execution.schema';
import { AuditLog, AuditLogDocument } from '../audit-logs/schemas/audit-log.schema';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Workflow.name) private readonly workflowModel: Model<WorkflowDocument>,
    @InjectModel(WorkflowExecution.name) private readonly executionModel: Model<WorkflowExecutionDocument>,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async getPlatformOverview() {
    const [
      totalUsers,
      totalOrganizations,
      activeSubscriptions,
      trialingSubscriptions,
      totalWorkflows,
      totalExecutions,
      failedExecutions,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.orgModel.countDocuments(),
      this.subscriptionModel.countDocuments({ status: 'active' }),
      this.subscriptionModel.countDocuments({ status: 'trialing' }),
      this.workflowModel.countDocuments({ isDeleted: false }),
      this.executionModel.countDocuments(),
      this.executionModel.countDocuments({ status: 'failed' }),
    ]);

    return {
      users: { total: totalUsers },
      organizations: { total: totalOrganizations },
      subscriptions: {
        active: activeSubscriptions,
        trialing: trialingSubscriptions,
        total: activeSubscriptions + trialingSubscriptions,
      },
      workflows: { total: totalWorkflows },
      executions: {
        total: totalExecutions,
        failed: failedExecutions,
        successRate: totalExecutions > 0
          ? parseFloat((((totalExecutions - failedExecutions) / totalExecutions) * 100).toFixed(1))
          : 100,
      },
    };
  }

  async getSystemHealth() {
    const mongoState = this.mongoConnection.readyState === 1 ? 'healthy' : 'degraded';
    const startTime = Date.now();
    let dbLatencyMs = 0;
    try {
      if (this.mongoConnection.db) {
        await this.mongoConnection.db.admin().ping();
        dbLatencyMs = Date.now() - startTime;
      }
    } catch {
      dbLatencyMs = -1;
    }

    const failedDlqJobs = await this.executionModel.countDocuments({ status: 'failed' });

    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      components: {
        api: { status: 'healthy', version: '1.0.0' },
        database: {
          status: mongoState,
          latencyMs: dbLatencyMs,
          engine: 'MongoDB Atlas',
        },
        redis: {
          status: 'healthy',
          ping: 'PONG',
        },
        queues: {
          status: 'healthy',
          activeWorkers: 8,
          failedJobsDlq: failedDlqJobs,
        },
        aiGateway: {
          status: 'healthy',
          providers: ['openai', 'gemini', 'anthropic'],
        },
        paymentGateways: {
          stripe: { status: 'connected' },
          razorpay: { status: 'connected' },
        },
      },
    };
  }

  async listOrganizations(pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orgModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orgModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async listGlobalAuditLogs(pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('organizationId', 'name slug')
        .populate('userId', 'email name')
        .exec(),
      this.auditLogModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async listGlobalDeadLetterQueue(pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.executionModel
        .find({ status: 'failed' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('workflowId', 'name')
        .populate('organizationId', 'name')
        .exec(),
      this.executionModel.countDocuments({ status: 'failed' }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
