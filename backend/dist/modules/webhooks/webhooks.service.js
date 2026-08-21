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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const crypto = require("crypto");
const webhook_endpoint_schema_1 = require("./schemas/webhook-endpoint.schema");
const webhook_delivery_schema_1 = require("./schemas/webhook-delivery.schema");
const queue_constants_1 = require("../../core/queue/queue.constants");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    endpointModel;
    deliveryModel;
    webhookQueue;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(endpointModel, deliveryModel, webhookQueue) {
        this.endpointModel = endpointModel;
        this.deliveryModel = deliveryModel;
        this.webhookQueue = webhookQueue;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createEndpoint(organizationId, workspaceId, userId, dto) {
        if (!dto.url || !dto.url.startsWith('http')) {
            throw new common_1.BadRequestException('A valid HTTP/HTTPS endpoint URL is required');
        }
        const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
        const endpoint = new this.endpointModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            url: dto.url,
            secret,
            eventTypes: dto.eventTypes && dto.eventTypes.length > 0 ? dto.eventTypes : ['*'],
            description: dto.description || '',
            status: 'active',
            createdBy: this.toObjectId(userId),
        });
        return endpoint.save();
    }
    async listEndpoints(organizationId, workspaceId) {
        return this.endpointModel
            .find({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getEndpointById(id, organizationId, workspaceId) {
        const endpoint = await this.endpointModel.findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        });
        if (!endpoint) {
            throw new common_1.NotFoundException('Webhook endpoint not found');
        }
        return endpoint;
    }
    async updateEndpoint(id, organizationId, workspaceId, updates) {
        const endpoint = await this.endpointModel.findOneAndUpdate({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        }, { $set: updates }, { new: true });
        if (!endpoint) {
            throw new common_1.NotFoundException('Webhook endpoint not found');
        }
        return endpoint;
    }
    async rotateSecret(id, organizationId, workspaceId) {
        const newSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
        const endpoint = await this.endpointModel.findOneAndUpdate({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        }, { $set: { secret: newSecret } }, { new: true });
        if (!endpoint) {
            throw new common_1.NotFoundException('Webhook endpoint not found');
        }
        return endpoint;
    }
    async deleteEndpoint(id, organizationId, workspaceId) {
        const res = await this.endpointModel.deleteOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        });
        if (res.deletedCount === 0) {
            throw new common_1.NotFoundException('Webhook endpoint not found');
        }
    }
    async dispatchOutboundEvent(organizationId, workspaceId, eventType, payload) {
        const endpoints = await this.endpointModel.find({
            organizationId: this.toObjectId(organizationId),
            status: 'active',
            $or: [{ eventTypes: '*' }, { eventTypes: eventType }],
        });
        const eventId = `evt_${crypto.randomBytes(16).toString('hex')}`;
        for (const ep of endpoints) {
            await this.webhookQueue.add('dispatch-webhook', {
                organizationId,
                workspaceId: ep.workspaceId.toString(),
                endpointId: ep._id.toString(),
                url: ep.url,
                secret: ep.secret,
                eventId,
                eventType,
                payload,
            }, {
                jobId: `hook-${ep._id}-${eventId}`,
                attempts: 5,
                backoff: { type: 'exponential', delay: 2000 },
            });
        }
        this.logger.log(`Enqueued outbound event [${eventType}] to ${endpoints.length} active webhook endpoints`);
        return endpoints.length;
    }
    async listDeliveries(organizationId, workspaceId, endpointId, pagination = {}) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        };
        if (endpointId) {
            filter.endpointId = this.toObjectId(endpointId);
        }
        const [data, total] = await Promise.all([
            this.deliveryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.deliveryModel.countDocuments(filter).exec(),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async testPing(endpointId, organizationId, workspaceId) {
        const ep = await this.getEndpointById(endpointId, organizationId, workspaceId);
        const pingPayload = {
            event: 'ping',
            message: 'Test webhook ping delivery from AI Automation SaaS',
            timestamp: new Date().toISOString(),
            endpointId: ep._id,
            organizationId,
        };
        return this.dispatchOutboundEvent(organizationId, workspaceId, 'ping', pingPayload);
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(webhook_endpoint_schema_1.WebhookEndpoint.name)),
    __param(1, (0, mongoose_1.InjectModel)(webhook_delivery_schema_1.WebhookDelivery.name)),
    __param(2, (0, bullmq_1.InjectQueue)(queue_constants_1.QUEUE_WEBHOOK_DISPATCH)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        bullmq_2.Queue])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map