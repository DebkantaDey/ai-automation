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
exports.PaymentSchema = exports.Payment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Payment = class Payment {
    organizationId;
    subscriptionId;
    provider;
    providerPaymentId;
    amount;
    currency;
    status;
    paymentMethod;
    paymentMethodDetails;
    receiptUrl;
    failureReason;
    metadata;
    createdAt;
    updatedAt;
};
exports.Payment = Payment;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payment.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Subscription', required: false, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payment.prototype, "subscriptionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['stripe', 'razorpay', 'manual'], required: true }),
    __metadata("design:type", String)
], Payment.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true, trim: true }),
    __metadata("design:type", String)
], Payment.prototype, "providerPaymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', uppercase: true, trim: true }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['succeeded', 'failed', 'pending', 'refunded', 'processing'],
        default: 'pending',
        index: true,
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Payment.prototype, "paymentMethodDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Payment.prototype, "receiptUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Payment.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Payment.prototype, "metadata", void 0);
exports.Payment = Payment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Payment);
exports.PaymentSchema = mongoose_1.SchemaFactory.createForClass(Payment);
exports.PaymentSchema.index({ organizationId: 1, createdAt: -1 });
exports.PaymentSchema.index({ provider: 1, providerPaymentId: 1 });
//# sourceMappingURL=payment.schema.js.map