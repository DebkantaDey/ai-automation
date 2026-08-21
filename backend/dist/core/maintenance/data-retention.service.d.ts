import { Model } from 'mongoose';
import { WorkflowExecutionDocument } from '../../modules/workflows/schemas/workflow-execution.schema';
import { AuditLogDocument } from '../../modules/audit-logs/schemas/audit-log.schema';
import { WebhookEventDocument } from '../../modules/billing/schemas/webhook-event.schema';
export declare class DataRetentionService {
    private readonly executionModel;
    private readonly auditLogModel;
    private readonly webhookModel;
    private readonly logger;
    constructor(executionModel: Model<WorkflowExecutionDocument>, auditLogModel: Model<AuditLogDocument>, webhookModel: Model<WebhookEventDocument>);
    purgeOldExecutions(olderThanDays?: number): Promise<number>;
    purgeOldWebhookEvents(olderThanDays?: number): Promise<number>;
    purgeOldAuditLogs(olderThanDays?: number): Promise<number>;
}
