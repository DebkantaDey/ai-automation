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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSchema = exports.Conversation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Conversation = class Conversation {
    organizationId;
    workspaceId;
    channel;
    contactName;
    contactIdentifier;
    customerId;
    leadId;
    status;
    unreadCount;
    lastMessageText;
    lastMessageAt;
    assignedUserId;
    assignedAgentId;
    isAiHandled;
    aiTakeoverReason;
    tags;
    metadata;
    isDeleted;
    deletedAt;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
};
exports.Conversation = Conversation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['whatsapp', 'email', 'webchat', 'sms'],
        index: true,
    }),
    __metadata("design:type", String)
], Conversation.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Conversation.prototype, "contactName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Conversation.prototype, "contactIdentifier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "leadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'open',
        enum: ['open', 'closed', 'snoozed'],
        index: true,
    }),
    __metadata("design:type", String)
], Conversation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "unreadCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Conversation.prototype, "lastMessageText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, index: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "assignedUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Agent', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "assignedAgentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isAiHandled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Conversation.prototype, "aiTakeoverReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Conversation.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Conversation.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Conversation.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "updatedBy", void 0);
exports.Conversation = Conversation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Conversation);
exports.ConversationSchema = mongoose_1.SchemaFactory.createForClass(Conversation);
exports.ConversationSchema.index({ organizationId: 1, channel: 1, isDeleted: 1 });
exports.ConversationSchema.index({ organizationId: 1, contactIdentifier: 1 });
exports.ConversationSchema.index({ organizationId: 1, lastMessageAt: -1 });
//# sourceMappingURL=conversation.schema.js.map