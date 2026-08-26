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
var ApprovalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const approval_request_schema_1 = require("../schemas/approval-request.schema");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let ApprovalsService = ApprovalsService_1 = class ApprovalsService {
    approvalModel;
    eventBus;
    logger = new common_1.Logger(ApprovalsService_1.name);
    constructor(approvalModel, eventBus) {
        this.approvalModel = approvalModel;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createApproval(organizationId, dto, workspaceId) {
        const approval = new this.approvalModel({
            ...dto,
            organizationId: this.toObjectId(organizationId),
            workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
            agentId: dto.agentId ? this.toObjectId(dto.agentId) : undefined,
            status: 'pending',
        });
        await approval.save();
        this.logger.log(`Created approval request [${approval.title}] for Org [${organizationId}]`);
        this.eventBus.emit('approvals.requested', organizationId, workspaceId, { approvalId: approval._id, actionType: approval.actionType, title: approval.title });
        return approval;
    }
    async listApprovals(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        };
        if (query.status && query.status !== 'all') {
            filter.status = query.status.toLowerCase();
        }
        if (query.actionType) {
            filter.actionType = query.actionType;
        }
        const [approvals, total] = await Promise.all([
            this.approvalModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('agentId', 'name model')
                .populate('reviewedByUserId', 'firstName lastName email')
                .exec(),
            this.approvalModel.countDocuments(filter).exec(),
        ]);
        return {
            data: approvals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getApprovalById(organizationId, id) {
        const approval = await this.approvalModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .populate('agentId', 'name model')
            .populate('reviewedByUserId', 'firstName lastName email')
            .exec();
        if (!approval) {
            throw new common_1.NotFoundException(`Approval request with id '${id}' not found`);
        }
        return approval;
    }
    async reviewApproval(organizationId, id, userId, decision, reviewNotes) {
        const approval = await this.getApprovalById(organizationId, id);
        if (approval.status !== 'pending') {
            throw new common_1.BadRequestException(`Approval request is already ${approval.status}`);
        }
        approval.status = decision;
        approval.reviewedByUserId = this.toObjectId(userId);
        approval.reviewedAt = new Date();
        approval.reviewNotes = reviewNotes || `Decision marked as ${decision}`;
        await approval.save();
        this.logger.log(`Approval [${approval._id}] reviewed as [${decision}] by User [${userId}]`);
        this.eventBus.emit('approvals.reviewed', organizationId, approval.workspaceId?.toString(), { approvalId: approval._id, decision, actionType: approval.actionType });
        return approval;
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = ApprovalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(approval_request_schema_1.ApprovalRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        event_bus_service_1.EventBusService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map