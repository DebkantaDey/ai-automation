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
exports.ApprovalRequestSchema = exports.ApprovalRequest = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ApprovalRequest = class ApprovalRequest {
    organizationId;
    workspaceId;
    agentId;
    executionId;
    actionType;
    title;
    reason;
    payload;
    status;
    requestedByAgentName;
    reviewedByUserId;
    reviewedAt;
    reviewNotes;
    isDeleted;
    deletedAt;
    createdAt;
    updatedAt;
};
exports.ApprovalRequest = ApprovalRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApprovalRequest.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApprovalRequest.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Agent', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApprovalRequest.prototype, "agentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "executionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['issue_refund', 'send_mass_whatsapp', 'apply_discount', 'delete_record', 'custom'],
        index: true,
    }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "actionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ApprovalRequest.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'pending',
        enum: ['pending', 'approved', 'rejected'],
        index: true,
    }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'AI Agent' }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "requestedByAgentName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApprovalRequest.prototype, "reviewedByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ApprovalRequest.prototype, "reviewedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "reviewNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], ApprovalRequest.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ApprovalRequest.prototype, "deletedAt", void 0);
exports.ApprovalRequest = ApprovalRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], ApprovalRequest);
exports.ApprovalRequestSchema = mongoose_1.SchemaFactory.createForClass(ApprovalRequest);
exports.ApprovalRequestSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
exports.ApprovalRequestSchema.index({ organizationId: 1, createdAt: -1 });
//# sourceMappingURL=approval-request.schema.js.map