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
exports.DealSchema = exports.Deal = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Deal = class Deal {
    organizationId;
    workspaceId;
    title;
    customerId;
    leadId;
    value;
    currency;
    stage;
    probability;
    expectedCloseDate;
    assignedUserId;
    notes;
    isDeleted;
    deletedAt;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
};
exports.Deal = Deal;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Deal.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Deal.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Deal.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Deal.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Deal.prototype, "leadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Deal.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', uppercase: true, trim: true }),
    __metadata("design:type", String)
], Deal.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'discovery',
        enum: ['discovery', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'],
        index: true,
    }),
    __metadata("design:type", String)
], Deal.prototype, "stage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 50, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Deal.prototype, "probability", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Deal.prototype, "expectedCloseDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Deal.prototype, "assignedUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Deal.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Deal.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Deal.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Deal.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Deal.prototype, "updatedBy", void 0);
exports.Deal = Deal = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Deal);
exports.DealSchema = mongoose_1.SchemaFactory.createForClass(Deal);
exports.DealSchema.index({ organizationId: 1, stage: 1, isDeleted: 1 });
exports.DealSchema.index({ organizationId: 1, value: -1 });
//# sourceMappingURL=deal.schema.js.map