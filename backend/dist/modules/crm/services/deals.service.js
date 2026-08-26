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
var DealsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const deal_schema_1 = require("../schemas/deal.schema");
const customer_activity_schema_1 = require("../schemas/customer-activity.schema");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let DealsService = DealsService_1 = class DealsService {
    dealModel;
    activityModel;
    eventBus;
    logger = new common_1.Logger(DealsService_1.name);
    constructor(dealModel, activityModel, eventBus) {
        this.dealModel = dealModel;
        this.activityModel = activityModel;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createDeal(organizationId, userId, dto, workspaceId) {
        const deal = new this.dealModel({
            ...dto,
            organizationId: this.toObjectId(organizationId),
            workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
            customerId: dto?.customerId ? this.toObjectId(dto.customerId) : undefined,
            leadId: dto?.leadId ? this.toObjectId(dto.leadId) : undefined,
            assignedUserId: dto?.assignedUserId ? this.toObjectId(dto.assignedUserId) : undefined,
            createdBy: userId ? this.toObjectId(userId) : undefined,
        });
        await deal.save();
        if (deal.customerId) {
            const activity = new this.activityModel({
                organizationId: this.toObjectId(organizationId),
                customerId: deal.customerId,
                activityType: 'stage_change',
                title: `Deal Created: ${deal.title}`,
                description: `Deal value: $${deal.value.toLocaleString()} (${deal.stage})`,
                source: 'human',
                createdBy: userId ? this.toObjectId(userId) : undefined,
            });
            await activity.save();
        }
        this.logger.log(`Created deal [${deal.title}] valued at [$${deal.value}] in Org [${organizationId}]`);
        this.eventBus.emit('crm.deal_created', organizationId, workspaceId, { dealId: deal._id, value: deal.value, stage: deal.stage });
        return deal;
    }
    async listDeals(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        };
        if (query.stage && query.stage !== 'ALL') {
            filter.stage = query.stage.toLowerCase();
        }
        if (query.customerId) {
            filter.customerId = this.toObjectId(query.customerId);
        }
        if (query.leadId) {
            filter.leadId = this.toObjectId(query.leadId);
        }
        if (query.search) {
            const regex = new RegExp(query.search, 'i');
            filter.title = regex;
        }
        const sortField = query.sortBy || 'createdAt';
        const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
        const [deals, total] = await Promise.all([
            this.dealModel
                .find(filter)
                .sort({ [sortField]: sortDirection })
                .skip(skip)
                .limit(limit)
                .populate('customerId', 'name company email phone')
                .populate('leadId', 'name company email phone')
                .populate('assignedUserId', 'firstName lastName email')
                .exec(),
            this.dealModel.countDocuments(filter).exec(),
        ]);
        return {
            data: deals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getDealById(organizationId, id) {
        const deal = await this.dealModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .populate('customerId', 'name company email phone')
            .populate('leadId', 'name company email phone')
            .populate('assignedUserId', 'firstName lastName email')
            .exec();
        if (!deal) {
            throw new common_1.NotFoundException(`Deal with id '${id}' not found`);
        }
        return deal;
    }
    async updateDeal(organizationId, id, dto, userId) {
        const deal = await this.getDealById(organizationId, id);
        const previousStage = deal.stage;
        Object.assign(deal, {
            ...dto,
            assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : deal.assignedUserId,
            updatedBy: userId ? this.toObjectId(userId) : undefined,
        });
        await deal.save();
        if (dto.stage && dto.stage !== previousStage && deal.customerId) {
            const activity = new this.activityModel({
                organizationId: this.toObjectId(organizationId),
                customerId: deal.customerId,
                activityType: 'stage_change',
                title: `Deal Stage Updated: ${deal.title}`,
                description: `Stage moved from ${previousStage} to ${dto.stage}`,
                source: 'human',
                createdBy: userId ? this.toObjectId(userId) : undefined,
            });
            await activity.save();
        }
        this.eventBus.emit('crm.deal_updated', organizationId, deal.workspaceId?.toString(), { dealId: deal._id, stage: deal.stage, value: deal.value });
        return deal;
    }
    async getPipelineSummary(organizationId) {
        const deals = await this.dealModel
            .find({
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .exec();
        const totalPipelineValue = deals
            .filter((d) => d.stage !== 'lost')
            .reduce((sum, d) => sum + (d.value || 0), 0);
        const weightedPipelineValue = deals
            .filter((d) => d.stage !== 'lost')
            .reduce((sum, d) => sum + (d.value || 0) * ((d.probability || 50) / 100), 0);
        const wonDeals = deals.filter((d) => d.stage === 'won');
        const lostDeals = deals.filter((d) => d.stage === 'lost');
        const closedDealsCount = wonDeals.length + lostDeals.length;
        const winRate = closedDealsCount > 0 ? (wonDeals.length / closedDealsCount) * 100 : 0;
        const stagesCount = {
            discovery: 0,
            qualified: 0,
            proposal_sent: 0,
            negotiation: 0,
            won: 0,
            lost: 0,
        };
        deals.forEach((d) => {
            if (stagesCount[d.stage] !== undefined) {
                stagesCount[d.stage] += 1;
            }
        });
        return {
            totalPipelineValue,
            weightedPipelineValue: Math.round(weightedPipelineValue),
            winRate: Math.round(winRate * 10) / 10,
            dealsCount: deals.length,
            wonValue: wonDeals.reduce((sum, d) => sum + (d.value || 0), 0),
            stagesCount,
        };
    }
    async deleteDeal(organizationId, id, userId) {
        const deal = await this.getDealById(organizationId, id);
        deal.isDeleted = true;
        deal.deletedAt = new Date();
        deal.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await deal.save();
        return true;
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = DealsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(deal_schema_1.Deal.name)),
    __param(1, (0, mongoose_1.InjectModel)(customer_activity_schema_1.CustomerActivity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        event_bus_service_1.EventBusService])
], DealsService);
//# sourceMappingURL=deals.service.js.map