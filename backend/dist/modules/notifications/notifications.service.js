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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const notification_preference_schema_1 = require("./schemas/notification-preference.schema");
const event_bus_service_1 = require("../../core/events/event-bus.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notificationModel;
    preferenceModel;
    eventBus;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(notificationModel, preferenceModel, eventBus) {
        this.notificationModel = notificationModel;
        this.preferenceModel = preferenceModel;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    onModuleInit() {
        if (this.eventBus) {
            this.eventBus.on('*', async (event) => {
                if (!event.organizationId)
                    return;
                let title = `System Event: ${event.type}`;
                let message = `Event ${event.type} triggered`;
                let type = 'info';
                if (event.type === 'workflow.completed') {
                    title = 'Workflow Execution Completed';
                    message = `Workflow [${event.data?.workflowId}] finished in ${event.data?.durationMs || 0}ms`;
                    type = 'success';
                }
                else if (event.type === 'workflow.failed') {
                    title = 'Workflow Execution Failed';
                    message = `Workflow execution failed: ${event.data?.error || 'Unknown error'}`;
                    type = 'error';
                }
                else if (event.type === 'workflow.waiting_approval') {
                    title = 'Approval Required for Workflow';
                    message = `Workflow execution paused waiting for ${event.data?.requiredRole || 'Manager'} approval`;
                    type = 'warning';
                }
                else if (event.type === 'payment.succeeded') {
                    title = 'Subscription Payment Succeeded';
                    message = 'Your subscription payment was processed successfully.';
                    type = 'success';
                }
                else if (event.type === 'payment.failed') {
                    title = 'Subscription Payment Failed';
                    message = 'Payment attempt failed. Please update your payment method.';
                    type = 'error';
                }
                try {
                    await this.createNotification(event.organizationId, event.workspaceId || '', undefined, {
                        title,
                        message,
                        type,
                        event: event.type,
                        metadata: event.data,
                    });
                }
                catch (err) {
                    this.logger.warn(`Failed to generate notification for event [${event.type}]: ${err.message}`);
                }
            });
        }
    }
    async createNotification(organizationId, workspaceId, userId, dto) {
        const notif = new this.notificationModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            userId: userId ? this.toObjectId(userId) : undefined,
            title: dto.title,
            message: dto.message,
            type: dto.type || 'info',
            event: dto.event,
            channel: dto.channel || 'in_app',
            linkUrl: dto.linkUrl || '',
            metadata: dto.metadata || {},
            isRead: false,
        });
        return notif.save();
    }
    async listNotifications(organizationId, workspaceId, userId, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            $or: [{ userId: this.toObjectId(userId) }, { userId: null }, { userId: { $exists: false } }],
        };
        const [data, total, unreadCount] = await Promise.all([
            this.notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.notificationModel.countDocuments(filter).exec(),
            this.notificationModel.countDocuments({ ...filter, isRead: false }).exec(),
        ]);
        return {
            data,
            total,
            unreadCount,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async markAsRead(id, organizationId, workspaceId) {
        const notif = await this.notificationModel.findOneAndUpdate({ _id: this.toObjectId(id), organizationId: this.toObjectId(organizationId) }, { $set: { isRead: true } }, { new: true });
        if (!notif) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return notif;
    }
    async markAllAsRead(organizationId, userId) {
        await this.notificationModel.updateMany({
            organizationId: this.toObjectId(organizationId),
            $or: [{ userId: this.toObjectId(userId) }, { userId: null }],
            isRead: false,
        }, { $set: { isRead: true } });
    }
    async getPreferences(userId, organizationId, workspaceId) {
        let pref = await this.preferenceModel.findOne({
            userId: this.toObjectId(userId),
            organizationId: this.toObjectId(organizationId),
        });
        if (!pref) {
            pref = new this.preferenceModel({
                userId: this.toObjectId(userId),
                organizationId: this.toObjectId(organizationId),
                workspaceId: this.toObjectId(workspaceId),
            });
            await pref.save();
        }
        return pref;
    }
    async updatePreferences(userId, organizationId, workspaceId, updates) {
        const pref = await this.preferenceModel.findOneAndUpdate({ userId: this.toObjectId(userId), organizationId: this.toObjectId(organizationId) }, { $set: updates }, { new: true, upsert: true });
        return pref;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(notification_preference_schema_1.NotificationPreference.name)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        event_bus_service_1.EventBusService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map