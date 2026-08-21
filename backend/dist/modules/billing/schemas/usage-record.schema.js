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
exports.UsageRecordSchema = exports.UsageRecord = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UsageRecord = class UsageRecord {
    organizationId;
    billingPeriod;
    workflowExecutions;
    aiExecutions;
    aiPromptTokens;
    aiCompletionTokens;
    aiTotalTokens;
    aiCostUsd;
    apiRequests;
    storageBytes;
    integrationsCount;
    documentsCount;
    lastResetAt;
    createdAt;
    updatedAt;
};
exports.UsageRecord = UsageRecord;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UsageRecord.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], UsageRecord.prototype, "billingPeriod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "workflowExecutions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "aiExecutions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "aiPromptTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "aiCompletionTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "aiTotalTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "aiCostUsd", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "apiRequests", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "storageBytes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "integrationsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], UsageRecord.prototype, "documentsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], UsageRecord.prototype, "lastResetAt", void 0);
exports.UsageRecord = UsageRecord = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], UsageRecord);
exports.UsageRecordSchema = mongoose_1.SchemaFactory.createForClass(UsageRecord);
exports.UsageRecordSchema.index({ organizationId: 1, billingPeriod: 1 }, { unique: true });
//# sourceMappingURL=usage-record.schema.js.map