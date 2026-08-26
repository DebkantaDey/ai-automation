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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const customer_schema_1 = require("../schemas/customer.schema");
const customer_activity_schema_1 = require("../schemas/customer-activity.schema");
const deal_schema_1 = require("../schemas/deal.schema");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let CustomersService = CustomersService_1 = class CustomersService {
    customerModel;
    activityModel;
    dealModel;
    eventBus;
    logger = new common_1.Logger(CustomersService_1.name);
    constructor(customerModel, activityModel, dealModel, eventBus) {
        this.customerModel = customerModel;
        this.activityModel = activityModel;
        this.dealModel = dealModel;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createCustomer(organizationId, userId, dto, workspaceId) {
        const customer = new this.customerModel({
            ...dto,
            organizationId: this.toObjectId(organizationId),
            workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
            assignedUserId: dto?.assignedUserId ? this.toObjectId(dto.assignedUserId) : undefined,
            createdBy: userId ? this.toObjectId(userId) : undefined,
        });
        await customer.save();
        const activity = new this.activityModel({
            organizationId: this.toObjectId(organizationId),
            customerId: customer._id,
            activityType: 'note',
            title: 'Customer Record Created',
            description: `Customer account established: ${customer.name} (${customer.company || 'Direct Client'})`,
            source: 'human',
            createdBy: userId ? this.toObjectId(userId) : undefined,
        });
        await activity.save();
        this.logger.log(`Created customer [${customer.name}] in Org [${organizationId}]`);
        this.eventBus.emit('crm.customer_created', organizationId, workspaceId, { customerId: customer._id, tier: customer.tier });
        return customer;
    }
    async listCustomers(organizationId, query = {}) {
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
        if (query.tier) {
            filter.tier = query.tier.toLowerCase();
        }
        if (query.search) {
            const regex = new RegExp(query.search, 'i');
            filter.$or = [{ name: regex }, { email: regex }, { company: regex }, { phone: regex }];
        }
        const sortField = query.sortBy || 'createdAt';
        const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
        const [customers, total] = await Promise.all([
            this.customerModel
                .find(filter)
                .sort({ [sortField]: sortDirection })
                .skip(skip)
                .limit(limit)
                .populate('assignedUserId', 'firstName lastName email')
                .exec(),
            this.customerModel.countDocuments(filter).exec(),
        ]);
        return {
            data: customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getCustomerById(organizationId, id) {
        const customer = await this.customerModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .populate('assignedUserId', 'firstName lastName email')
            .exec();
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with id '${id}' not found`);
        }
        return customer;
    }
    async getCustomer360(organizationId, customerId) {
        const customer = await this.getCustomerById(organizationId, customerId);
        const [activities, deals] = await Promise.all([
            this.activityModel
                .find({
                customerId: this.toObjectId(customerId),
                organizationId: this.toObjectId(organizationId),
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .exec(),
            this.dealModel
                .find({
                customerId: this.toObjectId(customerId),
                organizationId: this.toObjectId(organizationId),
                isDeleted: false,
            })
                .sort({ createdAt: -1 })
                .exec(),
        ]);
        return {
            customer,
            activities,
            deals,
            metrics: {
                totalSpend: customer.totalSpend,
                lifetimeValue: customer.lifetimeValue,
                openDealsCount: deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length,
                wonDealsValue: deals
                    .filter((d) => d.stage === 'won')
                    .reduce((sum, d) => sum + (d.value || 0), 0),
            },
        };
    }
    async addActivity(organizationId, customerId, dto, userId) {
        await this.getCustomerById(organizationId, customerId);
        const activity = new this.activityModel({
            ...dto,
            organizationId: this.toObjectId(organizationId),
            customerId: this.toObjectId(customerId),
            createdBy: userId ? this.toObjectId(userId) : undefined,
        });
        await activity.save();
        await this.customerModel.updateOne({ _id: this.toObjectId(customerId) }, { $set: { lastInteractionAt: new Date() } });
        return activity;
    }
    async updateCustomer(organizationId, id, dto, userId) {
        const customer = await this.getCustomerById(organizationId, id);
        Object.assign(customer, {
            ...dto,
            assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : customer.assignedUserId,
            updatedBy: userId ? this.toObjectId(userId) : undefined,
        });
        await customer.save();
        return customer;
    }
    async deleteCustomer(organizationId, id, userId) {
        const customer = await this.getCustomerById(organizationId, id);
        customer.isDeleted = true;
        customer.deletedAt = new Date();
        customer.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await customer.save();
        return true;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(1, (0, mongoose_1.InjectModel)(customer_activity_schema_1.CustomerActivity.name)),
    __param(2, (0, mongoose_1.InjectModel)(deal_schema_1.Deal.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        event_bus_service_1.EventBusService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map