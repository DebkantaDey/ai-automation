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
exports.CustomerSchema = exports.Customer = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Customer = class Customer {
    organizationId;
    workspaceId;
    name;
    email;
    phone;
    company;
    status;
    tier;
    totalSpend;
    lifetimeValue;
    currency;
    tags;
    aiInsights;
    churnRisk;
    assignedUserId;
    convertedFromLeadId;
    customFields;
    lastInteractionAt;
    isDeleted;
    deletedAt;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
};
exports.Customer = Customer;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Customer.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Customer.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Customer.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, lowercase: true, trim: true, default: '' }),
    __metadata("design:type", String)
], Customer.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Customer.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'active',
        enum: ['active', 'churned', 'inactive', 'onboarding'],
        index: true,
    }),
    __metadata("design:type", String)
], Customer.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'starter',
        enum: ['starter', 'pro', 'enterprise', 'custom'],
    }),
    __metadata("design:type", String)
], Customer.prototype, "tier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "totalSpend", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "lifetimeValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', uppercase: true, trim: true }),
    __metadata("design:type", String)
], Customer.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Customer.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Customer.prototype, "aiInsights", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'low',
        enum: ['low', 'medium', 'high'],
    }),
    __metadata("design:type", String)
], Customer.prototype, "churnRisk", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Customer.prototype, "assignedUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Lead', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Customer.prototype, "convertedFromLeadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Customer.prototype, "customFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Customer.prototype, "lastInteractionAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Customer.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Customer.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Customer.prototype, "updatedBy", void 0);
exports.Customer = Customer = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Customer);
exports.CustomerSchema = mongoose_1.SchemaFactory.createForClass(Customer);
exports.CustomerSchema.index({ organizationId: 1, isDeleted: 1 });
exports.CustomerSchema.index({ organizationId: 1, email: 1 });
exports.CustomerSchema.index({ organizationId: 1, phone: 1 });
exports.CustomerSchema.index({ organizationId: 1, totalSpend: -1 });
//# sourceMappingURL=customer.schema.js.map