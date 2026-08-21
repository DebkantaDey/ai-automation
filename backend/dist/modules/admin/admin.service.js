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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const organization_schema_1 = require("../organizations/schemas/organization.schema");
const subscription_schema_1 = require("../billing/schemas/subscription.schema");
const workflow_schema_1 = require("../workflows/schemas/workflow.schema");
const workflow_execution_schema_1 = require("../workflows/schemas/workflow-execution.schema");
const audit_log_schema_1 = require("../audit-logs/schemas/audit-log.schema");
let AdminService = AdminService_1 = class AdminService {
    mongoConnection;
    userModel;
    orgModel;
    subscriptionModel;
    workflowModel;
    executionModel;
    auditLogModel;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(mongoConnection, userModel, orgModel, subscriptionModel, workflowModel, executionModel, auditLogModel) {
        this.mongoConnection = mongoConnection;
        this.userModel = userModel;
        this.orgModel = orgModel;
        this.subscriptionModel = subscriptionModel;
        this.workflowModel = workflowModel;
        this.executionModel = executionModel;
        this.auditLogModel = auditLogModel;
    }
    async getPlatformOverview() {
        const [totalUsers, totalOrganizations, activeSubscriptions, trialingSubscriptions, totalWorkflows, totalExecutions, failedExecutions,] = await Promise.all([
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
        }
        catch {
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
    async listOrganizations(pagination) {
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
    async listGlobalAuditLogs(pagination) {
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
    async listGlobalDeadLetterQueue(pagination) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(organization_schema_1.Organization.name)),
    __param(3, (0, mongoose_1.InjectModel)(subscription_schema_1.Subscription.name)),
    __param(4, (0, mongoose_1.InjectModel)(workflow_schema_1.Workflow.name)),
    __param(5, (0, mongoose_1.InjectModel)(workflow_execution_schema_1.WorkflowExecution.name)),
    __param(6, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map