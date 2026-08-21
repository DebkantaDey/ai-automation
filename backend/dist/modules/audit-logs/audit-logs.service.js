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
var AuditLogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("./schemas/audit-log.schema");
let AuditLogsService = AuditLogsService_1 = class AuditLogsService {
    auditLogModel;
    logger = new common_1.Logger(AuditLogsService_1.name);
    constructor(auditLogModel) {
        this.auditLogModel = auditLogModel;
    }
    async log(params) {
        try {
            const logEntry = new this.auditLogModel({
                organizationId: new mongoose_2.Types.ObjectId(params.organizationId),
                workspaceId: params.workspaceId ? new mongoose_2.Types.ObjectId(params.workspaceId) : undefined,
                userId: params.userId ? new mongoose_2.Types.ObjectId(params.userId) : undefined,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                changes: params.changes || {},
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            });
            await logEntry.save();
        }
        catch (error) {
            this.logger.error(`Failed to write audit log: ${error.message}`);
        }
    }
    async list(organizationId, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: new mongoose_2.Types.ObjectId(organizationId),
        };
        if (pagination.search) {
            filter.$or = [
                { action: { $regex: pagination.search, $options: 'i' } },
                { entityType: { $regex: pagination.search, $options: 'i' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.auditLogModel
                .find(filter)
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.auditLogModel.countDocuments(filter).exec(),
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
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = AuditLogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map