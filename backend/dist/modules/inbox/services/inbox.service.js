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
var InboxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("../schemas/conversation.schema");
const message_schema_1 = require("../schemas/message.schema");
const customer_schema_1 = require("../../crm/schemas/customer.schema");
const customer_activity_schema_1 = require("../../crm/schemas/customer-activity.schema");
const whatsapp_service_1 = require("./whatsapp.service");
const email_channel_service_1 = require("./email-channel.service");
const ai_reply_generator_service_1 = require("./ai-reply-generator.service");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let InboxService = InboxService_1 = class InboxService {
    conversationModel;
    messageModel;
    customerModel;
    activityModel;
    whatsappService;
    emailService;
    aiReplyService;
    eventBus;
    logger = new common_1.Logger(InboxService_1.name);
    constructor(conversationModel, messageModel, customerModel, activityModel, whatsappService, emailService, aiReplyService, eventBus) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
        this.customerModel = customerModel;
        this.activityModel = activityModel;
        this.whatsappService = whatsappService;
        this.emailService = emailService;
        this.aiReplyService = aiReplyService;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async listConversations(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        };
        if (query.channel && query.channel !== 'all') {
            filter.channel = query.channel.toLowerCase();
        }
        if (query.status && query.status !== 'all') {
            filter.status = query.status.toLowerCase();
        }
        if (query.isAiHandled !== undefined) {
            filter.isAiHandled = query.isAiHandled;
        }
        if (query.search) {
            const regex = new RegExp(query.search, 'i');
            filter.$or = [{ contactName: regex }, { contactIdentifier: regex }, { lastMessageText: regex }];
        }
        const [conversations, total] = await Promise.all([
            this.conversationModel
                .find(filter)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('customerId', 'name company tier totalSpend')
                .populate('assignedUserId', 'firstName lastName email')
                .exec(),
            this.conversationModel.countDocuments(filter).exec(),
        ]);
        return {
            data: conversations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getConversationById(organizationId, id) {
        const conv = await this.conversationModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .populate('customerId', 'name company email phone tier totalSpend aiInsights')
            .populate('assignedUserId', 'firstName lastName email')
            .exec();
        if (!conv) {
            throw new common_1.NotFoundException(`Conversation with id '${id}' not found`);
        }
        return conv;
    }
    async getMessages(organizationId, conversationId, limit = 50) {
        await this.getConversationById(organizationId, conversationId);
        return this.messageModel
            .find({
            conversationId: this.toObjectId(conversationId),
            organizationId: this.toObjectId(organizationId),
        })
            .sort({ createdAt: 1 })
            .limit(limit)
            .exec();
    }
    async sendMessage(organizationId, conversationId, userId, dto) {
        const conv = await this.getConversationById(organizationId, conversationId);
        const message = new this.messageModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: conv.workspaceId,
            conversationId: conv._id,
            channel: conv.channel,
            direction: 'outbound',
            senderType: 'human',
            senderId: userId,
            senderName: 'Support Agent',
            content: dto.content,
            attachments: dto.attachments || [],
            status: 'sent',
            createdBy: this.toObjectId(userId),
        });
        await message.save();
        conv.lastMessageText = dto.content;
        conv.lastMessageAt = new Date();
        conv.unreadCount = 0;
        await conv.save();
        if (conv.customerId) {
            const act = new this.activityModel({
                organizationId: this.toObjectId(organizationId),
                customerId: conv.customerId,
                activityType: 'message',
                title: `Outbound ${conv.channel.toUpperCase()} Message Sent`,
                description: dto.content.slice(0, 150),
                source: 'human',
                createdBy: this.toObjectId(userId),
            });
            await act.save();
        }
        this.eventBus.emit('inbox.message_sent', organizationId, conv.workspaceId?.toString(), { conversationId: conv._id, messageId: message._id, channel: conv.channel });
        return message;
    }
    async processInboundMessage(organizationId, dto, workspaceId) {
        let conv = await this.conversationModel.findOne({
            organizationId: this.toObjectId(organizationId),
            channel: dto.channel,
            contactIdentifier: dto.senderIdentifier,
            isDeleted: false,
        });
        if (!conv) {
            const customer = await this.customerModel.findOne({
                organizationId: this.toObjectId(organizationId),
                $or: [{ phone: dto.senderIdentifier }, { email: dto.senderIdentifier }],
                isDeleted: false,
            });
            conv = new this.conversationModel({
                organizationId: this.toObjectId(organizationId),
                workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
                channel: dto.channel,
                contactName: dto.senderName || dto.senderIdentifier,
                contactIdentifier: dto.senderIdentifier,
                customerId: customer?._id,
                status: 'open',
                unreadCount: 1,
                lastMessageText: dto.content,
                lastMessageAt: new Date(),
                isAiHandled: true,
            });
            await conv.save();
        }
        else {
            conv.unreadCount += 1;
            conv.lastMessageText = dto.content;
            conv.lastMessageAt = new Date();
            if (conv.status === 'closed') {
                conv.status = 'open';
            }
            await conv.save();
        }
        const message = new this.messageModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: conv.workspaceId,
            conversationId: conv._id,
            channel: dto.channel,
            direction: 'inbound',
            senderType: 'customer',
            senderName: dto.senderName || conv.contactName,
            senderId: dto.senderIdentifier,
            content: dto.content,
            status: 'delivered',
            externalMessageId: dto.externalMessageId || '',
            rawPayload: dto.rawPayload || {},
        });
        await message.save();
        let aiReplyText;
        if (conv.isAiHandled) {
            const recentMessages = await this.getMessages(organizationId, conv._id.toString(), 10);
            const customer = conv.customerId
                ? await this.customerModel.findById(conv.customerId).exec()
                : null;
            const aiSuggestion = await this.aiReplyService.generateReply(conv, recentMessages, customer);
            aiReplyText = aiSuggestion.replyText;
            message.aiGeneratedDraft = aiSuggestion.replyText;
            message.aiConfidence = aiSuggestion.confidence;
            await message.save();
        }
        if (conv.customerId) {
            const act = new this.activityModel({
                organizationId: this.toObjectId(organizationId),
                customerId: conv.customerId,
                activityType: 'message',
                title: `Inbound ${dto.channel.toUpperCase()} Message Received`,
                description: dto.content.slice(0, 150),
                source: 'human',
            });
            await act.save();
        }
        this.eventBus.emit('inbox.message_received', organizationId, conv.workspaceId?.toString(), { conversationId: conv._id, messageId: message._id, channel: dto.channel });
        return {
            conversation: conv,
            message,
            aiReply: aiReplyText,
        };
    }
    async toggleTakeover(organizationId, conversationId, userId, dto) {
        const conv = await this.getConversationById(organizationId, conversationId);
        conv.isAiHandled = dto.isAiHandled;
        conv.aiTakeoverReason = dto.reason || (dto.isAiHandled ? 'Automated AI handling enabled' : 'Staff agent takeover');
        conv.updatedBy = this.toObjectId(userId);
        await conv.save();
        this.eventBus.emit('inbox.takeover_toggled', organizationId, conv.workspaceId?.toString(), { conversationId: conv._id, isAiHandled: conv.isAiHandled });
        return conv;
    }
    async suggestReply(organizationId, conversationId) {
        const conv = await this.getConversationById(organizationId, conversationId);
        const recentMessages = await this.getMessages(organizationId, conversationId, 10);
        const customer = conv.customerId
            ? await this.customerModel.findById(conv.customerId).exec()
            : null;
        return this.aiReplyService.generateReply(conv, recentMessages, customer);
    }
    async updateConversation(organizationId, conversationId, userId, dto) {
        const conv = await this.getConversationById(organizationId, conversationId);
        Object.assign(conv, {
            ...dto,
            assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : conv.assignedUserId,
            updatedBy: this.toObjectId(userId),
        });
        await conv.save();
        return conv;
    }
};
exports.InboxService = InboxService;
exports.InboxService = InboxService = InboxService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(2, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(3, (0, mongoose_1.InjectModel)(customer_activity_schema_1.CustomerActivity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        whatsapp_service_1.WhatsAppService,
        email_channel_service_1.EmailChannelService,
        ai_reply_generator_service_1.AiReplyGeneratorService,
        event_bus_service_1.EventBusService])
], InboxService);
//# sourceMappingURL=inbox.service.js.map