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
exports.MessageSchema = exports.Message = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Message = class Message {
    organizationId;
    workspaceId;
    conversationId;
    channel;
    direction;
    senderType;
    senderId;
    senderName;
    content;
    attachments;
    status;
    externalMessageId;
    rawPayload;
    aiGeneratedDraft;
    aiConfidence;
    createdBy;
    createdAt;
};
exports.Message = Message;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "conversationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['whatsapp', 'email', 'webchat', 'sms'],
    }),
    __metadata("design:type", String)
], Message.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['inbound', 'outbound'],
        index: true,
    }),
    __metadata("design:type", String)
], Message.prototype, "direction", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['customer', 'ai', 'human', 'system'],
        index: true,
    }),
    __metadata("design:type", String)
], Message.prototype, "senderType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Message.prototype, "senderName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                type: { type: String, required: true },
                url: { type: String, required: true },
                name: { type: String, default: '' },
                size: { type: Number, default: 0 },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Message.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'sent',
        enum: ['sent', 'delivered', 'read', 'failed'],
        index: true,
    }),
    __metadata("design:type", String)
], Message.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Message.prototype, "externalMessageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Message.prototype, "rawPayload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Message.prototype, "aiGeneratedDraft", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 1 }),
    __metadata("design:type", Number)
], Message.prototype, "aiConfidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "createdBy", void 0);
exports.Message = Message = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Message);
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
exports.MessageSchema.index({ conversationId: 1, createdAt: 1 });
exports.MessageSchema.index({ organizationId: 1, createdAt: -1 });
exports.MessageSchema.index({ externalMessageId: 1 }, { sparse: true });
//# sourceMappingURL=message.schema.js.map