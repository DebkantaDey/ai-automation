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
var LeadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const lead_schema_1 = require("../schemas/lead.schema");
const customer_schema_1 = require("../schemas/customer.schema");
const deal_schema_1 = require("../schemas/deal.schema");
const customer_activity_schema_1 = require("../schemas/customer-activity.schema");
const lead_scoring_service_1 = require("./lead-scoring.service");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let LeadsService = LeadsService_1 = class LeadsService {
    leadModel;
    customerModel;
    dealModel;
    activityModel;
    scoringService;
    eventBus;
    logger = new common_1.Logger(LeadsService_1.name);
    constructor(leadModel, customerModel, dealModel, activityModel, scoringService, eventBus) {
        this.leadModel = leadModel;
        this.customerModel = customerModel;
        this.dealModel = dealModel;
        this.activityModel = activityModel;
        this.scoringService = scoringService;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createLead(organizationId, userId, dto, workspaceId) {
        const lead = new this.leadModel({
            ...dto,
            organizationId: this.toObjectId(organizationId),
            workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
            assignedUserId: dto?.assignedUserId ? this.toObjectId(dto.assignedUserId) : undefined,
            createdBy: userId ? this.toObjectId(userId) : undefined,
        });
        const scoreResult = await this.scoringService.scoreLead(lead);
        lead.leadScore = scoreResult.score;
        lead.scoreConfidence = scoreResult.confidence;
        lead.scoreReasons = scoreResult.reasons;
        lead.priority = scoreResult.priority;
        lead.scoreGeneratedAt = new Date();
        await lead.save();
        this.logger.log(`Created lead [${lead.name}] with score [${lead.leadScore}] in Org [${organizationId}]`);
        this.eventBus.emit('crm.lead_created', organizationId, workspaceId, { leadId: lead._id, score: lead.leadScore, priority: lead.priority });
        return lead;
    }
    async listLeads(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        };
        if (query.status && query.status !== 'ALL') {
            filter.status = query.status.toLowerCase();
        }
        if (query.source) {
            filter.source = query.source.toLowerCase();
        }
        if (query.priority) {
            filter.priority = query.priority.toLowerCase();
        }
        if (query.search) {
            const regex = new RegExp(query.search, 'i');
            filter.$or = [{ name: regex }, { email: regex }, { company: regex }, { phone: regex }];
        }
        const sortField = query.sortBy || 'createdAt';
        const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
        const [leads, total] = await Promise.all([
            this.leadModel
                .find(filter)
                .sort({ [sortField]: sortDirection })
                .skip(skip)
                .limit(limit)
                .populate('assignedUserId', 'firstName lastName email')
                .exec(),
            this.leadModel.countDocuments(filter).exec(),
        ]);
        return {
            data: leads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getLeadById(organizationId, id) {
        const lead = await this.leadModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .populate('assignedUserId', 'firstName lastName email')
            .exec();
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with id '${id}' not found`);
        }
        return lead;
    }
    async updateLead(organizationId, id, dto, userId) {
        const lead = await this.getLeadById(organizationId, id);
        Object.assign(lead, {
            ...dto,
            assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : lead.assignedUserId,
            updatedBy: userId ? this.toObjectId(userId) : undefined,
        });
        await lead.save();
        this.eventBus.emit('crm.lead_updated', organizationId, lead.workspaceId?.toString(), { leadId: lead._id, status: lead.status });
        return lead;
    }
    async scoreLeadById(organizationId, id, promptContext) {
        const lead = await this.getLeadById(organizationId, id);
        const scoreResult = await this.scoringService.scoreLead(lead, promptContext);
        lead.leadScore = scoreResult.score;
        lead.scoreConfidence = scoreResult.confidence;
        lead.scoreReasons = scoreResult.reasons;
        lead.priority = scoreResult.priority;
        lead.scoreGeneratedAt = new Date();
        await lead.save();
        return lead;
    }
    async convertLead(organizationId, userId, id, dto) {
        const lead = await this.getLeadById(organizationId, id);
        const customer = new this.customerModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: lead.workspaceId,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            status: 'active',
            tier: 'starter',
            convertedFromLeadId: lead._id,
            aiInsights: `Converted from lead with score ${lead.leadScore}/100. ${lead.scoreReasons?.join('. ')}`,
            createdBy: this.toObjectId(userId),
        });
        await customer.save();
        let deal = null;
        if (dto.dealTitle || dto.dealValue) {
            deal = new this.dealModel({
                organizationId: this.toObjectId(organizationId),
                workspaceId: lead.workspaceId,
                title: dto.dealTitle || `Deal - ${lead.company || lead.name}`,
                customerId: customer._id,
                leadId: lead._id,
                value: dto.dealValue || 0,
                stage: 'qualified',
                probability: 60,
                createdBy: this.toObjectId(userId),
            });
            await deal.save();
        }
        const activity = new this.activityModel({
            organizationId: this.toObjectId(organizationId),
            customerId: customer._id,
            leadId: lead._id,
            activityType: 'stage_change',
            title: 'Lead Converted to Customer',
            description: `Lead [${lead.name}] converted into Customer account [${customer._id}]`,
            source: 'human',
            createdBy: this.toObjectId(userId),
        });
        await activity.save();
        lead.status = 'won';
        lead.convertedCustomerId = customer._id;
        await lead.save();
        this.eventBus.emit('crm.lead_converted', organizationId, lead.workspaceId?.toString(), { leadId: lead._id, customerId: customer._id, dealId: deal?._id });
        return {
            lead,
            customer,
            deal,
        };
    }
    async deleteLead(organizationId, id, userId) {
        const lead = await this.getLeadById(organizationId, id);
        lead.isDeleted = true;
        lead.deletedAt = new Date();
        lead.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await lead.save();
        return true;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = LeadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(lead_schema_1.Lead.name)),
    __param(1, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(2, (0, mongoose_1.InjectModel)(deal_schema_1.Deal.name)),
    __param(3, (0, mongoose_1.InjectModel)(customer_activity_schema_1.CustomerActivity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        lead_scoring_service_1.LeadScoringService,
        event_bus_service_1.EventBusService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map