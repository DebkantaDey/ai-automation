"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DataRetentionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRetentionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const workflow_execution_schema_1 = require("../../modules/workflows/schemas/workflow-execution.schema");
const audit_log_schema_1 = require("../../modules/audit-logs/schemas/audit-log.schema");
const webhook_event_schema_1 = require("../../modules/billing/schemas/webhook-event.schema");
let DataRetentionService = DataRetentionService_1 = class DataRetentionService {
    executionModel;
    auditLogModel;
    webhookModel;
    logger = new common_1.Logger(DataRetentionService_1.name);
    constructor(executionModel, auditLogModel, webhookModel) {
        this.executionModel = executionModel;
        this.auditLogModel = auditLogModel;
        this.webhookModel = webhookModel;
    }
    async purgeOldExecutions(olderThanDays = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const result = await this.executionModel.deleteMany({
            createdAt: { $lt: cutoffDate },
            status: { $in: ['completed', 'failed', 'cancelled'] },
        });
        this.logger.log(`[Retention] Purged ${result.deletedCount} executions older than ${olderThanDays} days`);
        return result.deletedCount;
    }
    async purgeOldWebhookEvents(olderThanDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const result = await this.webhookModel.deleteMany({
            createdAt: { $lt: cutoffDate },
        });
        this.logger.log(`[Retention] Purged ${result.deletedCount} webhook events older than ${olderThanDays} days`);
        return result.deletedCount;
    }
    async purgeOldAuditLogs(olderThanDays = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const result = await this.auditLogModel.deleteMany({
            createdAt: { $lt: cutoffDate },
        });
        this.logger.log(`[Retention] Purged ${result.deletedCount} audit logs older than ${olderThanDays} days`);
        return result.deletedCount;
    }
};
exports.DataRetentionService = DataRetentionService;
exports.DataRetentionService = DataRetentionService = DataRetentionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(workflow_execution_schema_1.WorkflowExecution.name)),
    __param(1, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __param(2, (0, mongoose_1.InjectModel)(webhook_event_schema_1.WebhookEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DataRetentionService);
//# sourceMappingURL=data-retention.service.js.map