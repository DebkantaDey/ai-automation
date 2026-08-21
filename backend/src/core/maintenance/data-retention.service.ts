import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkflowExecution, WorkflowExecutionDocument } from '../../modules/workflows/schemas/workflow-execution.schema';
import { AuditLog, AuditLogDocument } from '../../modules/audit-logs/schemas/audit-log.schema';
import { WebhookEvent, WebhookEventDocument } from '../../modules/billing/schemas/webhook-event.schema';

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(
    @InjectModel(WorkflowExecution.name) private readonly executionModel: Model<WorkflowExecutionDocument>,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
    @InjectModel(WebhookEvent.name) private readonly webhookModel: Model<WebhookEventDocument>,
  ) {}

  async purgeOldExecutions(olderThanDays = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.executionModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ['completed', 'failed', 'cancelled'] },
    });

    this.logger.log(`[Retention] Purged ${result.deletedCount} executions older than ${olderThanDays} days`);
    return result.deletedCount;
  }

  async purgeOldWebhookEvents(olderThanDays = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.webhookModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    this.logger.log(`[Retention] Purged ${result.deletedCount} webhook events older than ${olderThanDays} days`);
    return result.deletedCount;
  }

  async purgeOldAuditLogs(olderThanDays = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.auditLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    this.logger.log(`[Retention] Purged ${result.deletedCount} audit logs older than ${olderThanDays} days`);
    return result.deletedCount;
  }
}
