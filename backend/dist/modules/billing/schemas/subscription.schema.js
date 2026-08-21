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
exports.SubscriptionSchema = exports.Subscription = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Subscription = class Subscription {
    organizationId;
    planId;
    provider;
    providerCustomerId;
    providerSubscriptionId;
    status;
    billingInterval;
    currentPeriodStart;
    currentPeriodEnd;
    trialStart;
    trialEnd;
    cancelAtPeriodEnd;
    cancelledAt;
    metadata;
    createdAt;
    updatedAt;
};
exports.Subscription = Subscription;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Subscription.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Plan', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Subscription.prototype, "planId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['stripe', 'razorpay', 'manual'],
        default: 'stripe',
    }),
    __metadata("design:type", String)
], Subscription.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: null }),
    __metadata("design:type", String)
], Subscription.prototype, "providerCustomerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: null, index: true }),
    __metadata("design:type", String)
], Subscription.prototype, "providerSubscriptionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'trialing', 'past_due', 'paused', 'cancelled', 'expired', 'incomplete'],
        default: 'active',
        index: true,
    }),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly',
    }),
    __metadata("design:type", String)
], Subscription.prototype, "billingInterval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Subscription.prototype, "currentPeriodStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: () => new Date(Date.now() + 30 * 24 * 3600 * 1000),
    }),
    __metadata("design:type", Date)
], Subscription.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Subscription.prototype, "trialStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Subscription.prototype, "trialEnd", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "cancelAtPeriodEnd", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Subscription.prototype, "cancelledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Subscription.prototype, "metadata", void 0);
exports.Subscription = Subscription = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Subscription);
exports.SubscriptionSchema = mongoose_1.SchemaFactory.createForClass(Subscription);
//# sourceMappingURL=subscription.schema.js.map